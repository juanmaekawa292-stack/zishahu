/**
 * batch-fix.js - 全量商品数据修复管线
 * 
 * 逻辑：
 * 1. 扫描所有商品文件夹，读取 xlsx 获取 SKU 数据
 * 2. 从 SKU 行提取规格参数（容量/泥料等）
 * 3. 读取本地图片文件，上传到COS
 * 4. 生成完整的 products.ts
 * 
 * 规则：
 * - 主图: 主图_1~5.jpg -> products/tk-xxx/main_1~5.webp
 * - 详情图: 详情_2~N.jpg -> products/tk-xxx/detail_2~N.webp（跳过详情_1）
 * - 视频: 1.mp4 -> videos/tk-xxx.mp4
 * - SKU图: 从xlsx col10获取URL（淘宝CDN），下载后上传
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const sharp = require("sharp");
const COS = require("cos-nodejs-sdk-v5");
const https = require("https");
const http = require("http");

// ─── Config ──────────────────────────────────────────────
const TUKUAI_BASE = "D:\\图快下载器\\淘宝采集";
const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_TS = path.join(ROOT, "src", "data", "products.ts");
const TEMP_DIR = path.join(ROOT, "data", "temp_images");

const cos = new COS({
  SecretId: "process.env.COS_SECRET_ID",
  SecretKey: "process.env.COS_SECRET_KEY",
});
const BUCKET = "zishahu-images-1301674224";
const REGION = "ap-hongkong";
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
  // Prefer the main xlsx (most descriptive name)
  var mainFile = files.filter(f => !f.includes("产品列表") && !f.includes("所有sku"));
  // Among remaining, prefer the one matching folder name
  var target = mainFile.length > 0 ? mainFile[0] : files[0];
  try {
    var wb = XLSX.readFile(path.join(folderPath, target));
    var ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1 });
  } catch(e) {
    return null;
  }
}

function getLocalFiles(folderPath) {
  var files = fs.readdirSync(folderPath);
  return {
    all: files,
    mainImgs: files.filter(f => f.startsWith("主图")).sort(),
    detailImgs: files.filter(f => f.startsWith("详情")).sort(),
    videos: files.filter(f => f.startsWith("视频") || f.endsWith(".mp4") || f.endsWith(".mov")).sort(),
  };
}

function detectCategory(title) {
  if (title.includes("壶") || title.includes("紫砂壶")) return "teapot";
  if (title.includes("杯") || title.includes("茶杯")) return "cup";
  if (title.includes("茶宠")) return "teaPet";
  if (title.includes("茶具配件") || title.includes("工具") || title.includes("茶盘") || title.includes("公道杯") || title.includes("壶承") || title.includes("盖碗") || title.includes("茶道")) return "teaTool";
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
  return text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "").replace(/\s+/g, "").toLowerCase().substring(0, 60);
}

function downloadFile(url, dest) {
  return new Promise(function(resolve, reject) {
    var protocol = url.startsWith("https") ? https : http;
    protocol.get(url, function(resp) {
      if (resp.statusCode !== 200) {
        reject(new Error("HTTP " + resp.statusCode + " for " + url.substring(0, 80)));
        return;
      }
      var file = fs.createWriteStream(dest);
      resp.pipe(file);
      file.on("finish", function() { file.close(); resolve(dest); });
    }).on("error", reject);
  });
}

function uploadToCos(localPath, cosKey) {
  return new Promise(function(resolve, reject) {
    cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: cosKey,
      Body: fs.createReadStream(localPath),
    }, function(err, data) {
      if (err) reject(err);
      else resolve(cosKey);
    });
  });
}

// Extract specs from variant names and xlsx rows
function extractSpecs(skuRows) {
  var specs = {};
  
  // Try to extract structured info from variant names
  var allNames = skuRows.map(function(r) { return String(r[0] || ""); });
  var allText = allNames.join(" ");
  
  // Capacity - look for patterns like "200ml", "200mL", "约220ml", "301mL(含)-400mL(含)"
  var capMatch = allText.match(/(约?\d+)\s*(ml|mL)/);
  if (capMatch) {
    specs.capacity = capMatch[1] + capMatch[2];
  } else {
    // Range capacity like "301mL(含)-400mL(含)"
    var capRange = allText.match(/(\d+mL.*?\d+mL)/);
    if (capRange) specs.capacity = capRange[1];
  }
  
  // Clay type - common keywords
  var clayKeywords = ["紫泥", "朱泥", "段泥", "大红袍", "绿泥", "降坡泥", "老紫泥", "底槽青", "紫砂", "黑泥", "天青泥", "本山绿"];
  for (var i = 0; i < clayKeywords.length; i++) {
    if (allText.includes(clayKeywords[i])) {
      specs.clay = clayKeywords[i];
      break;
    }
  }
  
  // Craft
  var craftKeywords = ["手工", "纯手工", "全手工", "半手工", "光素", "刻绘", "描金", "浮雕", "珐琅"];
  for (var i = 0; i < craftKeywords.length; i++) {
    if (allText.includes(craftKeywords[i])) {
      specs.craft = craftKeywords[i];
      break;
    }
  }
  
  // Shape type - extract from SKU names
  var shapeKeywords = ["石瓢", "西施", "仿古", "汉瓦", "德钟", "掇只", "掇球", "龙蛋", "思亭", "君德", "水平", "潘壶", "美人肩", "秦权", "汉棠", "如意", "四方", "归兽", "大曲"];
  for (var i = 0; i < shapeKeywords.length; i++) {
    if (allText.includes(shapeKeywords[i])) {
      specs.shapeType = shapeKeywords[i];
      break;
    }
  }
  
  // Handmade
  if (allText.includes("纯手工") || allText.includes("全手工")) {
    specs.handmade = "全手工";
  } else if (allText.includes("手工")) {
    specs.handmade = "手工";
  }
  
  // Origin
  if (allText.includes("宜兴")) {
    specs.origin = "宜兴市";
  }
  
  return specs;
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log("=== 全量商品数据修复管线 ===\n");

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Step 1: Collect all folders
  console.log("Step 1: 扫描商品文件夹...");
  var allFolders = [];
  var rootDirs = fs.readdirSync(TUKUAI_BASE).filter(x => x.startsWith("00_"));
  rootDirs.forEach(d => allFolders.push(path.join(TUKUAI_BASE, d)));
  ["0615", "616"].forEach(function(sub) {
    allFolders = allFolders.concat(listProductDirs(path.join(TUKUAI_BASE, sub)));
  });
  console.log("  共 " + allFolders.length + " 个文件夹\n");

  // Step 2: Read all product data
  console.log("Step 2: 读取商品数据...");
  var productList = [];

  allFolders.forEach(function(folder) {
    var data = readXlsx(folder);
    if (!data || data.length < 2) {
      console.log("  ⚠️ 无XLSX:", path.basename(folder).substring(0, 40));
      return;
    }
    var files = getLocalFiles(folder);
    var productUrl = data[1] ? String(data[1][11] || "") : "";
    var productName = data[1] ? String(data[1][12] || "") : path.basename(folder);
    var itemId = extractItemId(productUrl);
    if (!itemId) {
      console.log("  ⚠️ 无itemId:", path.basename(folder).substring(0, 40));
      return;
    }

    // Get SKU rows (skip header row 0)
    var skuRows = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) skuRows.push(data[i]);
    }

    // Min price from SKUs
    var minPrice = Infinity;
    skuRows.forEach(function(r) {
      var p = parseFloat(r[3]);
      if (!isNaN(p) && p < minPrice) minPrice = p;
    });

    productList.push({
      folder: folder,
      productUrl: productUrl,
      productName: productName,
      itemId: itemId,
      skuRows: skuRows,
      skuCount: skuRows.length,
      minPrice: minPrice === Infinity ? 0 : minPrice,
      mainImgs: files.mainImgs,
      detailImgs: files.detailImgs,
      videos: files.videos,
    });

    console.log("  📦 " + path.basename(folder).substring(0, 35) + " -> " + itemId + " SKU:" + skuRows.length + " 主图:" + files.mainImgs.length + " 详情:" + files.detailImgs.length + " 视频:" + files.videos.length);
  });

  console.log("\n  共 " + productList.length + " 个商品\n");

  if (productList.length === 0) {
    console.log("没有商品数据，退出");
    return;
  }

  // Step 3: Match to existing products or assign new IDs
  console.log("Step 3: 匹配商品ID...");
  
  // Read existing products.ts
  var tsContent = fs.readFileSync(PRODUCTS_TS, "utf-8");
  
  // Extract existing product IDs and their sourceUrls
  var existingIds = [];
  var existingIdPattern = /id: "(tk-\d+)"/g;
  var existingUrlPattern = /sourceUrl: "([^"]+)"/g;
  var idMatch, urlMatch;
  while ((idMatch = existingIdPattern.exec(tsContent)) !== null) {
    existingIds.push(idMatch[1]);
  }

  // Build itemId->tkId mapping
  var itemIdMap = {};
  var urlPattern = /sourceUrl: "([^"]+)"/g;
  var idIdx = 0;
  while ((urlMatch = urlPattern.exec(tsContent)) !== null && idIdx < existingIds.length) {
    var url = urlMatch[1];
    var iId = extractItemId(url);
    if (iId) itemIdMap[iId] = existingIds[idIdx];
    idIdx++;
  }

  // Assign IDs to all products
  var nextId = existingIds.length + 1;
  var matchedProducts = [];

  productList.forEach(function(p) {
    var tkId = itemIdMap[p.itemId];
    var isNew = false;
    if (!tkId) {
      tkId = "tk-" + String(nextId++).padStart(3, "0");
      isNew = true;
    }
    p.tkId = tkId;
    p.isNew = isNew;
    matchedProducts.push(p);
    
    console.log("  " + tkId + (isNew ? " [新增]" : " [已存在]") + " " + p.productName.substring(0, 40));
  });

  console.log("");

  // Step 4: Process and upload images
  console.log("Step 4: 处理图片并上传COS...");

  var totalUploaded = 0;
  var totalFailed = 0;

  for (var idx = 0; idx < matchedProducts.length; idx++) {
    var p = matchedProducts[idx];
    var folder = p.folder;
    var tkId = p.tkId;

    process.stdout.write("  [" + (idx + 1) + "/" + matchedProducts.length + "] " + tkId + " " + path.basename(folder).substring(0, 25) + "...");

    var uploaded = 0;
    var failed = 0;

    // Upload main images (主图_1~5.jpg -> main_1~5.webp)
    for (var i = 0; i < Math.min(p.mainImgs.length, 5); i++) {
      var localFile = path.join(folder, p.mainImgs[i]);
      if (!fs.existsSync(localFile)) { failed++; continue; }
      var cosKey = "products/" + tkId + "/main_" + (i + 1) + ".webp";
      try {
        var webpPath = localFile.replace(/\.\w+$/, ".webp");
        await sharp(localFile)
          .resize(1200, 1200, { fit: "cover", position: "center" })
          .webp({ quality: 85 })
          .toFile(webpPath);
        await uploadToCos(webpPath, cosKey);
        uploaded++;
        if (webpPath !== localFile) try { fs.unlinkSync(webpPath); } catch(e) {}
      } catch(e) {
        process.stdout.write("m" + (i+1) + "!");
        failed++;
      }
    }

    // Upload detail images (详情_2~N.jpg, skip 详情_1)
    for (var i = 1; i < p.detailImgs.length; i++) { // start from index 1 (skip 详情_1)
      var localFile = path.join(folder, p.detailImgs[i]);
      if (!fs.existsSync(localFile)) { failed++; continue; }
      var cosKey = "products/" + tkId + "/detail_" + (i + 1) + ".webp";
      try {
        var webpPath = localFile.replace(/\.\w+$/, ".webp");
        await sharp(localFile)
          .resize(1200, 1200, { fit: "inside", position: "center" })
          .webp({ quality: 85 })
          .toFile(webpPath);
        await uploadToCos(webpPath, cosKey);
        uploaded++;
        if (webpPath !== localFile) try { fs.unlinkSync(webpPath); } catch(e) {}
      } catch(e) {
        process.stdout.write("d" + (i+1) + "!");
        failed++;
      }
    }

    // Upload video (1.mp4 -> videos/tk-xxx.mp4)
    for (var i = 0; i < Math.min(p.videos.length, 1); i++) {
      var localFile = path.join(folder, p.videos[i]);
      if (!fs.existsSync(localFile)) continue;
      var cosKey = "videos/" + tkId + ".mp4";
      try {
        await uploadToCos(localFile, cosKey);
        uploaded++;
      } catch(e) {
        process.stdout.write("v!");
        failed++;
      }
    }

    // Download SKU images from xlsx col10 and upload
    for (var s = 0; s < Math.min(p.skuRows.length, 10); s++) {
      var url = String(p.skuRows[s][10] || "").trim();
      if (!url || !url.startsWith("http")) continue;
      var cosKey = "products/" + tkId + "/variant_" + (s + 1) + ".webp";
      try {
        var tempFile = path.join(TEMP_DIR, tkId + "_var_" + s + path.extname(url.split("?")[0]) || ".jpg");
        await downloadFile(url, tempFile);
        var webpPath = tempFile.replace(/\.\w+$/, ".webp");
        await sharp(tempFile)
          .resize(600, 600, { fit: "cover" })
          .webp({ quality: 80 })
          .toFile(webpPath);
        await uploadToCos(webpPath, cosKey);
        uploaded++;
        try { fs.unlinkSync(tempFile); } catch(e) {}
        try { fs.unlinkSync(webpPath); } catch(e) {}
      } catch(e) {
        process.stdout.write("s!");
        failed++;
      }
    }

    totalUploaded += uploaded;
    totalFailed += failed;
    console.log(" " + uploaded + "↑ " + (failed > 0 ? failed + "✗" : ""));
  }

  console.log("\n  总计上传: " + totalUploaded + " 失败: " + totalFailed + "\n");

  // Step 5: Generate products.ts
  console.log("Step 5: 生成 products.ts...");

  var zhTWMap = {
    "宜兴": "宜興", "紫砂壶": "紫砂壺", "手工": "手工",
    "西施": "西施", "仿古": "仿古", "石瓢": "石瓢",
    "汉瓦": "漢瓦", "德钟": "德鐘", "龙蛋": "龍蛋",
    "思亭": "思亭", "君德": "君德", "潘壶": "潘壺",
    "美人肩": "美人肩", "秦权": "秦權", "如意": "如意",
    "四方": "四方", "归兽": "歸獸", "大曲": "大曲",
    "原矿": "原礦", "紫泥": "紫泥", "朱泥": "朱泥",
    "段泥": "段泥", "绿泥": "綠泥", "纯手工": "純手工",
    "全手工": "全手工", "功夫": "工夫", "茶具": "茶具",
    "泡茶": "泡茶", "套装": "套裝", "礼盒": "禮盒",
    "送礼": "送禮", "家用": "家用", "品茗": "品茗",
    "公道杯": "公道杯", "主人杯": "主人杯", "茶杯": "茶杯",
    "茶宠": "茶寵", "茶道": "茶道",
  };

  function toTW(text) {
    var result = text;
    var sorted = Object.keys(zhTWMap).sort(function(a,b) { return b.length - a.length; });
    for (var i = 0; i < sorted.length; i++) {
      result = result.split(sorted[i]).join(zhTWMap[sorted[i]]);
    }
    return result;
  }

  function esc(str) {
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  }

  var productStrings = [];

  for (var idx = 0; idx < matchedProducts.length; idx++) {
    var p = matchedProducts[idx];
    var tkId = p.tkId;
    var title = p.productName;
    var category = detectCategory(title);
    var pricing = calcPrice(p.minPrice);
    var specs = extractSpecs(p.skuRows);

    if (!pricing) {
      console.log("  ⚠️ " + tkId + " 定价过低: ¥" + p.minPrice + ", 跳过");
      continue;
    }

    var slug = slugify(title);
    if (slug.length < 10) slug = slugify("紫砂壶 " + title);

    var images = [];
    for (var i = 0; i < Math.min(p.mainImgs.length, 5); i++) {
      images.push(COS_BASE + "/products/" + tkId + "/main_" + (i + 1) + ".webp");
    }

    var detailImages = [];
    for (var i = 1; i < p.detailImgs.length; i++) {
      detailImages.push(COS_BASE + "/products/" + tkId + "/detail_" + (i + 1) + ".webp");
    }

    var videos = [];
    if (p.videos.length > 0) {
      videos.push(COS_BASE + "/videos/" + tkId + ".mp4");
    }

    // Build variants
    var variants = [];
    for (var s = 0; s < p.skuRows.length; s++) {
      var row = p.skuRows[s];
      var varName = String(row[0] || "");
      var varPrice = parseFloat(row[3]) || 0;
      var varPricing = calcPrice(varPrice);
      if (!varPricing) continue;
      
      variants.push({
        id: tkId + "-" + String(s + 1).padStart(2, "0"),
        name_zhCN: varName,
        name_zhTW: toTW(varName),
        price: varPricing.price,
        originalPrice: varPricing.originalPrice,
        stock: parseInt(row[7]) || 100,
        image: COS_BASE + "/products/" + tkId + "/variant_" + (s + 1) + ".webp",
        sku: String(row[2] || ""),
      });
    }

    var createdAt = "2026-06-17";

    var obj = {
      id: tkId,
      slug: slug,
      title_zhCN: title,
      title_zhTW: toTW(title),
      description_zhCN: title + "，精选优质原矿紫砂，全手工精制而成。",
      description_zhTW: toTW(title + "，精选优质原矿紫砂，全手工精制而成。"),
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      images: images,
      category: category,
      inStock: true,
      stock: 100,
      featured: idx < 20,
      specs: specs,
      createdAt: createdAt,
      rating: 4.8,
      reviewCount: 0,
      detailImages: detailImages,
      variants: variants.length > 0 ? variants : undefined,
      sourceUrl: p.productUrl,
      sourceSku: p.itemId,
      videos: videos,
      shipping: { weight: 1.5, dimensions: { length: 25, width: 20, height: 15 } },
    };

    productStrings.push(JSON.stringify(obj, null, 2));
  }

  // Build the TypeScript file
  var tsOut = 'import type { Product } from "@/types";\n\nexport const products: Product[] = [\n';
  tsOut += productStrings.join(",\n") + "\n];\n";

  fs.writeFileSync(PRODUCTS_TS, tsOut, "utf-8");
  console.log("  已写入 " + productStrings.length + " 个商品\n");

  // Write tracking
  var tracking = [
    "# Data Fix Report - " + new Date().toISOString(),
    "",
    "## Summary",
    "- Total products: " + productStrings.length,
    "- Images uploaded to COS: " + totalUploaded,
    "- Upload failures: " + totalFailed,
    "",
  ];
  fs.writeFileSync(path.join(ROOT, "tracking.md"), tracking.join("\n"), "utf-8");
  console.log("  tracking.md 已更新\n");

  console.log("=== 完成 ===");
}

main().catch(function(e) {
  console.error("Fatal:", e.message, e.stack);
  process.exit(1);
});
