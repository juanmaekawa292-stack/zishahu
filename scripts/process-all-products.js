const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const sharp = require("sharp");
const COS = require("cos-nodejs-sdk-v5");

// ─── Config ──────────────────────────────────────────────
const TUKUAI_BASE = "D:\\图快下载器\\淘宝采集";
const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_TS = path.join(ROOT, "src", "data", "products.ts");
const TEMP_DIR = path.join(ROOT, "data", "temp_images");

const cos = new COS({
  SecretId: "process.env.COS_SECRET_ID",
  SecretKey: "process.env.COS_SECRET_KEY",
});
const COS_BUCKET = "zishahu-images-1301674224";
const COS_REGION = "ap-hongkong";
const COS_BASE = "https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com";

// ─── Helpers ─────────────────────────────────────────────
function listProductDirs(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  return fs.readdirSync(baseDir)
    .filter(x => /^[0-7]/.test(x))
    .map(x => path.join(baseDir, x));
}

function extractItemId(url) {
  if (!url) return "";
  var m = url.match(/[?&]id=(\d+)/);
  return m ? m[1] : "";
}

function readXlsx(folderPath) {
  var files = fs.readdirSync(folderPath).filter(f => f.endsWith(".xlsx"));
  if (files.length === 0) return null;
  // Prefer main xlsx file
  var mainFile = files.filter(f => !f.includes("下载详情") && !f.includes("产品列表") && !f.includes("所有sku"));
  var target = mainFile.length > 0 ? mainFile[0] : files[0];
  try {
    var wb = XLSX.readFile(path.join(folderPath, target));
    var ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1 });
  } catch(e) {
    console.log("  XLSX error:", target, e.message);
    return null;
  }
}

function getLocalFiles(folderPath) {
  var files = fs.readdirSync(folderPath);
  return {
    mainImgs: files.filter(f => f.startsWith("主图")).sort(),
    detailImgs: files.filter(f => f.startsWith("详情")).sort(),
    videos: files.filter(f => f.startsWith("视频") || f.endsWith(".mp4")).sort(),
    variantImgs: files.filter(f => /^\d+_.*\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith("主图") && !f.startsWith("详情")).sort(),
    all: files,
  };
}

function detectCategory(title) {
  if (title.includes("壶") || title.includes("紫砂壶")) return "teapot";
  if (title.includes("杯") || title.includes("茶杯")) return "cup";
  if (title.includes("茶宠")) return "teaPet";
  if (title.includes("茶具配件") || title.includes("工具")) return "teaTool";
  if (title.includes("套装") || title.includes("礼盒") || title.includes("礼品")) return "gift";
  return "teapot";
}

function calcPrice(rmb) {
  if (!rmb || rmb < 150) return null;
  var usd = Math.round(rmb * 10 / 7.25);
  usd = Math.floor(usd / 10) * 10 + 9;
  if (usd < 19) usd = 19;
  var orig = Math.round(usd * 1.3);
  return { price: usd, originalPrice: orig > usd ? orig : undefined };
}

function slugify(text) {
  return text
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .substring(0, 60);
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log("=== 商品数据全量处理管线 ===\n");

  // Ensure temp dir
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Step 1: Collect all folders
  console.log("Step 1: 扫描商品文件夹...");
  var allFolders = [];
  // Root-level
  var rootDirs = fs.readdirSync(TUKUAI_BASE).filter(x => x.startsWith("00_"));
  rootDirs.forEach(d => allFolders.push(path.join(TUKUAI_BASE, d)));
  // Subdirs
  ["0615", "616"].forEach(function(sub) {
    allFolders = allFolders.concat(listProductDirs(path.join(TUKUAI_BASE, sub)));
  });
  console.log("  共 " + allFolders.length + " 个文件夹\n");

  // Step 2: Read all product data
  console.log("Step 2: 读取商品数据...");
  var productMap = {}; // keyed by itemId
  var unmatched = [];

  allFolders.forEach(function(folder) {
    var data = readXlsx(folder);
    if (!data || data.length < 2) {
      console.log("  ⚠️ 无XLSX数据:", path.basename(folder).substring(0, 40));
      unmatched.push({ folder: folder, reason: "no_xlsx" });
      return;
    }
    var files = getLocalFiles(folder);
    var productUrl = data[1] ? String(data[1][11] || "") : "";
    var productName = data[1] ? String(data[1][12] || "") : path.basename(folder);
    var itemId = extractItemId(productUrl);

    if (!itemId) {
      console.log("  ⚠️ 无itemId:", path.basename(folder).substring(0, 40));
      unmatched.push({ folder: folder, reason: "no_itemId" });
      return;
    }

    if (productMap[itemId]) {
      console.log("  ⚠️ 重复itemId:", itemId, path.basename(folder).substring(0, 30));
    } else {
      console.log("  📦 " + path.basename(folder).substring(0, 35) + " -> " + itemId + " | 主图:" + files.mainImgs.length + " 详情:" + files.detailImgs.length + " 视频:" + files.videos.length);
    }

    productMap[itemId] = {
      folder: folder,
      productUrl: productUrl,
      productName: productName,
      itemId: itemId,
      xlsxData: data,
      files: files,
    };
  });

  console.log("\n  共 " + Object.keys(productMap).length + " 个商品, " + unmatched.length + " 个未匹配\n");

  // Step 3: Process images - upload local files to COS
  // This handles main images, detail images, variant images
  console.log("Step 3: 上传图片到COS...");

  var cosUploaded = 0;
  var cosSkipped = 0;
  var cosFailed = 0;

  for (var itemId in productMap) {
    var p = productMap[itemId];
    var folderName = path.basename(p.folder);

    // Generate tk-id from existing mapping or assign new
    // We'll figure this out in step 4

    // Upload main images
    for (var i = 0; i < Math.min(p.files.mainImgs.length, 5); i++) {
      var localFile = path.join(p.folder, p.files.mainImgs[i]);
      var cosKey = "products/tk-" + itemId + "/main_" + (i + 1) + ".webp";
      // Check if already on COS
      var cosUrl = COS_BASE + "/" + cosKey;
      // For now just record what we'd upload
      cosSkipped++;
    }

    // Upload detail images
    for (var i = 0; i < Math.min(p.files.detailImgs.length, 30); i++) {
      var cosKey = "products/tk-" + itemId + "/detail_" + (i + 1) + ".webp";
      cosSkipped++;
    }
  }

  console.log("  Skipped (placeholder): " + cosSkipped + "\n");

  // Step 4: Generate products.ts
  console.log("Step 4: 生成数据...");
  console.log("  (TODO: Full generation in next phase)\n");

  console.log("=== 完成 ===");
}

main().catch(function(e) {
  console.error("Fatal:", e.message, e.stack);
  process.exit(1);
});
