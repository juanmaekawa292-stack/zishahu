/**
 * process-tukuai.js - 处理图快下载器采集的淘宝商品数据
 *
 * 功能：
 * 1. 读取 D:\图快下载器\淘宝采集\ 目录下的商品数据
 * 2. 复制图片到 public/images/products/
 * 3. 生成 src/data/products.ts（替换旧数据）
 * 4. 导出 Shopify CSV
 *
 * 定价：采集价 × 10（老板确认）
 * 最低采集价：¥150
 *
 * Usage: node scripts/process-tukuai.js
 */

const fs = require("fs");
const path = require("path");

// ─── 配置 ──────────────────────────────────────────────
const TUKUAI_DIR = "D:\\图快下载器\\淘宝采集";
const PUBLIC_IMG_DIR = path.join(__dirname, "..", "public", "images", "products");
const DATA_DIR = path.join(__dirname, "..", "data");
const PRODUCTS_TS = path.join(__dirname, "..", "src", "data", "products.ts");
const EXPORT_DIR = path.join(DATA_DIR, "exports");

const PRICE_COEFFICIENT = 10;
const PRICE_MIN_RMB = 150;
const EXCHANGE_RATE = 7.25;

// ─── 定价引擎 ──────────────────────────────────────────
const PRICE_BRACKETS = [
  { rmbMin: 0, rmbMax: 100, usdMin: 19, usdMax: 39, label: "配件/小件" },
  { rmbMin: 100, rmbMax: 300, usdMin: 39, usdMax: 79, label: "入门级茶具" },
  { rmbMin: 300, rmbMax: 600, usdMin: 79, usdMax: 169, label: "精品级茶具" },
  { rmbMin: 600, rmbMax: 1500, usdMin: 169, usdMax: 399, label: "收藏级茶具" },
  { rmbMin: 1500, rmbMax: 5000, usdMin: 399, usdMax: 999, label: "大师级作品" },
  { rmbMin: 5000, rmbMax: Infinity, usdMin: 999, usdMax: 4999, label: "顶级藏品" },
];

function calculatePrice(rmbPrice, coefficient) {
  if (coefficient === undefined) coefficient = PRICE_COEFFICIENT;
  const rawUSD = (rmbPrice * coefficient) / EXCHANGE_RATE;
  const bracket = PRICE_BRACKETS.find(function(b) { return rmbPrice >= b.rmbMin && rmbPrice < b.rmbMax; });
  var finalPrice = Math.round(rawUSD);
  if (bracket) { finalPrice = Math.max(bracket.usdMin, Math.min(bracket.usdMax, finalPrice)); }
  finalPrice = Math.floor(finalPrice / 10) * 10 + 9;
  if (finalPrice < 5) { finalPrice = Math.round(rawUSD); }
  var suggestedOriginal = Math.round(finalPrice * (1.2 + Math.random() * 0.3));
  return {
    price: finalPrice,
    originalPrice: suggestedOriginal > finalPrice ? suggestedOriginal : undefined,
    rmbOriginal: rmbPrice,
    coefficient: coefficient,
    bracket: bracket ? bracket.label : "自定义",
  };
}

// ─── 图片映射 ──────────────────────────────────────────
const IMAGE_MAP = [
  // Product 1: 石瓢壶
  { pid: 0, local: "主图_1.jpg", web: "shipiao-main-1.jpg" },
  { pid: 0, local: "主图_2.jpg", web: "shipiao-main-2.jpg" },
  { pid: 0, local: "主图_3.jpg", web: "shipiao-main-3.jpg" },
  { pid: 0, local: "11_彩绘款单壶 约240ml【以此为准】.jpg", web: "shipiao-caihui-danhu.jpg" },
  { pid: 0, local: "12_刻绘款单壶 约240ml【以此为准】.jpg", web: "shipiao-kehui-danhu.jpg" },
  { pid: 0, local: "13_素颜款单壶 约240ml【以此为准】.jpg", web: "shipiao-suyan-danhu.jpg" },
  { pid: 0, local: "14_彩绘款大套装 约240ml【以此为准】.jpg", web: "shipiao-caihui-set.jpg" },
  { pid: 0, local: "15_刻绘款大套装 约240ml【以此为准】.jpg", web: "shipiao-kehui-set.jpg" },
  { pid: 0, local: "16_素颜款大套装 约240ml【以此为准】.jpg", web: "shipiao-suyan-set.jpg" },
  // Product 2: 归兽壶
  { pid: 1, local: "主图_1.jpg", web: "guishou-main-1.jpg" },
  { pid: 1, local: "主图_2.jpg", web: "guishou-main-2.jpg" },
  { pid: 1, local: "主图_3.jpg", web: "guishou-main-3.jpg" },
  { pid: 1, local: "11_单壶.jpg", web: "guishou-danhu.jpg" },
  { pid: 1, local: "12_一壶四杯.jpg", web: "guishou-1hu4bei.jpg" },
  { pid: 1, local: "13_一壶六杯.jpg", web: "guishou-1hu6bei.jpg" },
];

// ─── 产品文件夹路径 ──────────────────────────────────
const PRODUCT_FOLDERS = [
  path.join(TUKUAI_DIR, "00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶"),
  path.join(TUKUAI_DIR, "00_古悦堂 宜兴紫砂壶套装纯手工正宗家用茶壶功夫茶具泡茶壶归兽壶"),
];

// ─── 解析页面数据.txt ────────────────────────────────
function parsePageData(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n").map(l => l.trim()).filter(l => l);

  const title = lines[0] || "";
  const priceLine = lines.find(l => /^价格[:：]\s*\d+/.test(l));
  const idLine = lines.find(l => /^商品Id[:：]\s*\d+/.test(l));
  const mainImageLine = lines.find(l => l.startsWith("主图地址"));

  const basePrice = priceLine ? parseInt(priceLine.replace(/^价格[:：]\s*/, "")) : 0;
  const itemId = idLine ? idLine.replace(/^商品Id[:：]\s*/, "").trim() : "";
  const urlLine = "https://item.taobao.com/item.htm?id=" + itemId;

  // Parse main image URLs
  let mainImages = [];
  if (mainImageLine) {
    const urlsStr = mainImageLine.replace(/^主图地址\s*[:：]\s*/, "");
    mainImages = urlsStr.split(";").map(u => u.trim()).filter(u => u.length > 0);
  }

  // Parse SKU blocks
  const skus = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith("名称:")) {
      const sku = { name: "", price: 0, image: "", skuId: "" };
      sku.name = lines[i].replace(/^名称[:：]\s*/, "").trim();
      i++;
      while (i < lines.length && !lines[i].startsWith("名称:") && !lines[i].includes("主图地址")) {
        if (lines[i].startsWith("skuId:")) sku.skuId = lines[i].replace(/^skuId:/, "").trim();
        else if (/^价格[:：]/.test(lines[i])) sku.price = parseInt(lines[i].replace(/^价格[:：]\s*/, ""));
        else if (lines[i].startsWith("图片链接:")) sku.image = lines[i].replace(/^图片链接:/, "").trim();
        i++;
      }
      skus.push(sku);
    } else {
      i++;
    }
  }

  return { title, basePrice, itemId, urlLine, mainImages, skus };
}

// ─── 生成 slug ────────────────────────────────────────
function toSlug(str) {
  return str
    .replace(/[^\u4e00-\u9fff\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// ─── 标题生成 ──────────────────────────────────────────
function generateTitles(rawTitle, skus) {
  let cleanTitle = rawTitle
    .replace(/古悦堂/g, "")
    .replace(/【以此为准】/g, "")
    .replace(/约\d+ml/g, "")
    .trim();

  const zhCN = "古悦堂" + cleanTitle;
  const TW_MAP = {
    "宜兴": "宜興", "紫砂壶": "紫砂壺", "纯": "純",
    "全手工": "全手工", "茶壶": "茶壺", "功夫茶具": "功夫茶具",
    "套装": "套裝", "家用": "家用", "泡茶壶": "泡茶壺",
    "经典": "經典", "正宗": "正宗", "手工": "手工", "制作": "製作",
  };
  var zhTW = zhCN;
  for (var k in TW_MAP) { zhTW = zhTW.replace(new RegExp(k, "g"), TW_MAP[k]); }

  return { zhCN, zhTW };
}

// ─── 描述生成 ──────────────────────────────────────────
function generateDescription(rawTitle, data) {
  const intro = "「人间珠玉安足取，岂如阳羡溪头一丸土」—— 宜兴紫砂，千年传承的茶道之魂。\n\n**" + rawTitle + "**\n\n### 产品亮点\n传承经典器型，精选优质泥料，由经验丰富的匠人手工制作。每一处细节都经过反复打磨，只为呈现最纯正的紫砂之美。\n\n";

  var skuSection = "";
  if (data.skus && data.skus.length > 0) {
    skuSection = "### 可选规格\n";
    data.skus.forEach(function(s) {
      skuSection += "  - " + s.name + "（¥" + s.price + "）\n";
    });
    skuSection += "\n";
  }

  const scenes = "### 适用场景\n- 日常品茗：与三五好友共品一壶好茶\n- 茶席雅集：为您的茶席增添一份东方美学\n- 礼赠亲友：精美包装，传递心意与品味\n- 个人收藏：匠人手作，每一把都是独一无二的艺术品\n\n### 养护小贴士\n1. 新壶使用前，建议用茶水煮沸30分钟以「开壶」\n2. 使用后及时清洗，保持壶内干爽\n3. 一壶一茶，让紫砂充分吸附茶香，日久生香\n4. 避免磕碰，存放于通风干燥处\n\n每件商品均附赠精美礼盒包装，是自用收藏与馈赠亲友的上佳之选。";

  return intro + skuSection + scenes;
}

function generateDescriptionTW(rawTitle, data) {
  const TW_MAP = {
    "宜兴": "宜興", "紫砂壶": "紫砂壺", "纯": "純",
    "全手工": "全手工", "茶壶": "茶壺", "功夫茶具": "功夫茶具",
    "套装": "套裝", "家用": "家用", "泡茶壶": "泡茶壺",
    "经典": "經典", "正宗": "正宗", "手工": "手工", "制作": "製作",
    "亮点": "亮點", "规格": "規格", "参数": "參數",
    "工艺": "工藝", "匠人": "匠人", "匠心": "匠心",
    "场景": "場景", "日常": "日常", "品茗": "品茗",
    "茶席": "茶席", "雅集": "雅集", "东方": "東方",
    "美学": "美學", "礼赠": "禮贈", "亲友": "親友",
    "精美": "精美", "包装": "包裝", "品味": "品味",
    "收藏": "收藏", "艺术品": "藝術品",
    "养护": "養護", "贴士": "貼士", "建议": "建議",
    "开水": "開水", "清洗": "清洗", "干爽": "乾爽",
    "吸附": "吸附", "茶香": "茶香", "日久生香": "日久生香",
    "磕碰": "磕碰", "存放": "存放", "通风": "通風",
    "干燥": "乾燥", "附赠": "附贈", "礼盒": "禮盒",
    "馈赠": "饋贈", "上佳之选": "上佳之選",
    "可选": "可選", "款式": "款式",
    "经验": "經驗", "丰富": "豐富",
    "反复": "反覆", "打磨": "打磨", "呈现": "呈現",
    "纯正": "純正",
    "独一": "獨一", "无二": "無二",
    "人间": "人間", "珠玉": "珠玉", "安足取": "安足取",
    "岂如": "豈如", "阳羡": "陽羨", "溪头": "溪頭",
    "一丸": "一丸", "传承": "傳承", "茶道": "茶道",
    "材质": "材質", "泥料": "泥料",
  };
  var result = rawTitle;
  for (var k in TW_MAP) { result = result.replace(new RegExp(k, "g"), TW_MAP[k]); }
  return result;
}

// ─── 分类推断 ──────────────────────────────────────────
function inferCategory(title) {
  if (/壶/.test(title)) return "teapot";
  if (/杯/.test(title)) return "cup";
  if (/宠/.test(title) || /玩/.test(title)) return "teaPet";
  if (/工具/.test(title) || /托盘/.test(title) || /茶盘/.test(title)) return "teaTool";
  return "teapot";
}

// ─── 主流程 ──────────────────────────────────────────
async function main() {
  console.log("=== 图快下载器 → 商品处理管线 ===");
  console.log("");

  // 1. Ensure directories exist
  [PUBLIC_IMG_DIR, EXPORT_DIR].forEach(function(d) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // 2. Read and parse product data
  const products = [];

  PRODUCT_FOLDERS.forEach(function(folderPath, idx) {
    const txtFile = path.join(folderPath, "页面数据.txt");
    if (!fs.existsSync(txtFile)) {
      console.log("⚠️ 未找到数据文件: " + txtFile);
      return;
    }

    console.log("读取: " + folderPath);
    const data = parsePageData(txtFile);
    console.log("  标题: " + data.title);
    console.log("  采集价: ¥" + data.basePrice);
    console.log("  SKU数: " + data.skus.length);

    if (data.basePrice < PRICE_MIN_RMB) {
      console.log("  ⏭ 跳过（¥" + data.basePrice + " < ¥" + PRICE_MIN_RMB + "）");
      return;
    }

    // Calculate pricing (10x)
    const pricing = calculatePrice(data.basePrice);

    // Determine images for this product
    const productImages = IMAGE_MAP.filter(function(m) { return m.pid === idx; });
    const imagePaths = productImages.map(function(m) { return "/images/products/" + m.web; });

    // Generate titles
    const titles = generateTitles(data.title, data.skus);

    // Generate descriptions
    const descCN = generateDescription(data.title, data);
    const descTW = generateDescriptionTW(descCN, data);

    // Generate slug
    var slug = toSlug(titles.zhCN);
    if (!slug || slug.length < 5) slug = "zisha-product-" + (idx + 1);

    // Product ID
    const productId = "tk-" + String(idx + 1).padStart(3, "0");
    const category = inferCategory(data.title);

    const product = {
      id: productId,
      slug: slug,
      title_zhCN: titles.zhCN,
      title_zhTW: titles.zhTW,
      description_zhCN: descCN,
      description_zhTW: descTW,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      images: imagePaths,
      category: category,
      inStock: true,
      stock: 100,
      featured: idx === 0,
      specs: { capacity: "", clay: "", craft: "手工制作", dimensions: "" },
      createdAt: new Date().toISOString().slice(0, 10),
      rating: 4.8,
      reviewCount: 0,
      sourceUrl: data.urlLine || "",
      sourceSku: data.itemId || "",
      videos: [],
      _pricing: pricing,
    };

    products.push(product);

    console.log("  定价: ¥" + data.basePrice + " → $" + pricing.price + " USD  [系数:" + pricing.coefficient + "x, 区间:" + pricing.bracket + "]");
    console.log("  SKU范围: ¥" + Math.min.apply(null, data.skus.map(function(s) { return s.price; })) + " ~ ¥" + Math.max.apply(null, data.skus.map(function(s) { return s.price; })));
    console.log("  图片: " + imagePaths.length + "张");
    console.log("");
  });

  if (products.length === 0) {
    console.log("❌ 没有合格的商品");
    process.exit(1);
  }

  console.log("✅ 共 " + products.length + " 个商品通过定价\n");

  // 3. Copy images to public/images/products/
  var copied = 0, skipped = 0, failed = 0;
  IMAGE_MAP.forEach(function(m) {
    if (m.pid >= products.length) return; // skip image mapping for unprocessed products
    const srcFile = path.join(PRODUCT_FOLDERS[m.pid], m.local);
    const dstFile = path.join(PUBLIC_IMG_DIR, m.web);

    if (!fs.existsSync(srcFile)) {
      console.log("  ⚠️ 源文件不存在: " + m.local);
      failed++;
      return;
    }
    if (fs.existsSync(dstFile)) {
      skipped++;
      return;
    }
    fs.copyFileSync(srcFile, dstFile);
    console.log("  ✅ " + m.local + " → " + m.web);
    copied++;
  });
  console.log("  图片: " + copied + " 张复制, " + skipped + " 张已存在, " + failed + " 张缺失");
  console.log("");

  // 4. Write products.ts
  console.log("写入: " + PRODUCTS_TS);

  const productStrings = products.map(function(p) {
    const esc = function(s) { return s.replace(/'/g, "\\'").replace(/\n/g, "\\n"); };
    var lines = [
      "  {",
      '    id: "' + p.id + '",',
      '    slug: "' + p.slug + '",',
      "    title_zhCN: '" + esc(p.title_zhCN) + "',",
      "    title_zhTW: '" + esc(p.title_zhTW) + "',",
      "    description_zhCN: '" + esc(p.description_zhCN) + "',",
      "    description_zhTW: '" + esc(p.description_zhTW) + "',",
      "    price: " + p.price + ",",
    ];
    if (p.originalPrice) {
      lines.push("    originalPrice: " + p.originalPrice + ",");
    }
    lines = lines.concat([
      "    images: " + JSON.stringify(p.images) + ",",
      '    category: "' + p.category + '",',
      "    inStock: " + p.inStock + ",",
      "    stock: " + p.stock + ",",
      "    featured: " + (p.featured || false) + ",",
      "    specs: " + JSON.stringify(p.specs) + ",",
      '    createdAt: "' + p.createdAt + '",',
      "    rating: " + p.rating + ",",
      "    reviewCount: " + p.reviewCount + ",",
      '    sourceUrl: "' + (p.sourceUrl || "") + '",',
      '    sourceSku: "' + (p.sourceSku || "") + '",',
      "    videos: [],",
      "  }",
    ]);
    return lines.join("\n");
  });

  const tsContent = 'import { Product } from "@/types";\n\n\nexport const products: Product[] = [\n' + productStrings.join(",\n\n") + "\n];\n";

  // Write with UTF-8 BOM-free
  fs.writeFileSync(PRODUCTS_TS, tsContent, "utf8");
  console.log("  ✅ " + products.length + " 个商品写入成功");
  console.log("");

  // 5. Generate Shopify CSV
  console.log("导出 Shopify CSV...");

  const csvHeader = [
    '"Handle","Title","Body (HTML)","Vendor","Type","Tags","Published","Option1 Name","Option1 Value","Variant SKU","Variant Price","Variant Compare At Price","Variant Inventory Qty","Variant Inventory Policy","Image Src","Image Alt Text"'
  ];

  const csvRows = products.map(function(p) {
    const handle = "zisha-" + p.id;
    const bodyHTML = "<div>" + p.description_zhCN.replace(/\n/g, "<br>") + "</div>";
    const imageSrc = (p.images && p.images.length > 0) ? ("https://zishapro.com" + p.images[0]) : "";
    var q = function(s) { return '"' + String(s).replace(/"/g, '""') + '"'; };
    return [q(handle), q(p.title_zhCN), q(bodyHTML), q("古悦堂"), q(p.category),
      q("手工,紫砂,茶具"), "TRUE", q("款式"), q("标准款"), q(p.id),
      q(p.price), q(p.originalPrice || ""), q(p.stock), "continue",
      q(imageSrc), q(p.title_zhCN)].join(",");
  });

  const csvContent = csvHeader.join("\n") + "\n" + csvRows.join("\n") + "\n";
  const csvFilename = "shopify-import-tukuai-" + new Date().toISOString().slice(0, 10) + ".csv";
  fs.writeFileSync(path.join(EXPORT_DIR, csvFilename), csvContent, "utf8");
  console.log("  ✅ CSV: " + csvFilename);
  console.log("");

  // 6. Summary
  console.log("=== 处理完成 ===");
  console.log("商品数: " + products.length);
  products.forEach(function(p) {
    console.log("  " + p.id + " | $" + p.price + " | " + p.title_zhCN.slice(0, 30) + "... | " + p.images.length + "张图");
  });
  console.log("");
  console.log("图片位置: " + PUBLIC_IMG_DIR);
  console.log("数据文件: " + PRODUCTS_TS);
  console.log("CSV导出: " + path.join(EXPORT_DIR, csvFilename));
}

main().catch(function(e) { console.error("❌ 致命错误:", e.message); console.error(e.stack); process.exit(1); });
