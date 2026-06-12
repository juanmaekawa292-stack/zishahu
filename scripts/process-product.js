/**
 * 商品处理管线 - Product Processing Pipeline
 *
 * 职责：将从采集系统（Thread 2）收到的原始商品数据处理为可售状态
 *
 * 使用方式：
 *   node scripts/process-product.js                    # 处理 data/raw_products/ 下所有待处理文件
 *   node scripts/process-product.js --file xxx.json    # 处理指定文件
 *   node scripts/process-product.js --preview          # 仅预览，不生成输出
 *
 * 定价系数默认 3x，可通过环境变量 PRICE_COEFFICIENT 覆盖
 * 汇率默认 7.25（RMB→USD），可通过环境变量 EXCHANGE_RATE 覆盖
 */

const fs = require("fs");
const path = require("path");

// ─── 配置 ──────────────────────────────────────────────
const RAW_DIR = path.join(__dirname, "..", "data", "raw_products");
const OUT_DIR = path.join(__dirname, "..", "data", "processed_products");
const EXPORT_DIR = path.join(__dirname, "..", "data", "exports");

const PRICE_COEFFICIENT = parseFloat(process.env.PRICE_COEFFICIENT || "3");
const EXCHANGE_RATE = parseFloat(process.env.EXCHANGE_RATE || "7.25");

// ─── 品类映射 ──────────────────────────────────────────
const CATEGORY_ALIASES = {
  "壶": "teapot", "茶壶": "teapot", "紫砂壶": "teapot",
  "杯": "cup", "茶杯": "cup",
  "茶宠": "teaPet", "茶具配件": "teaTool", "工具": "teaTool",
  "套装": "gift", "礼盒": "gift", "礼品": "gift",
};

function detectCategory(title, categoryHint) {
  if (categoryHint && CATEGORY_ALIASES[categoryHint]) return CATEGORY_ALIASES[categoryHint];
  for (const [kw, cat] of Object.entries(CATEGORY_ALIASES)) {
    if (title.includes(kw)) return cat;
  }
  return "teapot";
}

// ─── 标题优化引擎 ──────────────────────────────────────
const MARKETING_STOPWORDS = [
  "包邮", "特价", "限时", "秒杀", "正品", "保证", "正品保证",
  "厂家直销", "批发", "一件代发", "促销", "活动价", "聚划算",
  "爆款", "热销", "推荐", "新品",
  "送礼首选", "礼盒装", "精美礼盒",
];

const ZH_TW_MAP = {
  "宜兴": "宜興", "紫砂壶": "紫砂壺", "手工制作": "手工製作",
  "功夫茶具": "功夫茶具", "西施壶": "西施壺", "石瓢壶": "石瓢壺",
  "仿古": "仿古", "如意": "如意", "龙蛋": "龍蛋", "段泥": "段泥",
  "朱泥": "朱泥", "紫泥": "紫泥", "原矿": "原礦",
  "纯手工": "純手工", "全手工": "全手工", "半手工": "半手工",
  "雕刻": "雕刻", "套装": "套裝", "茶杯": "茶杯", "茶宠": "茶寵",
  "茶具": "茶具", "茶道": "茶道", "美学": "美學", "礼盒": "禮盒",
  "送礼": "送禮", "精品": "精品", "优质": "優質", "精选": "精選",
  "大师": "大師", "传承": "傳承", "经典": "經典", "传统": "傳統",
  "工艺": "工藝", "艺术": "藝術",
};

function toTraditional(text) {
  let result = text;
  const sortedKeys = Object.keys(ZH_TW_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.split(key).join(ZH_TW_MAP[key]);
  }
  result = result
    .split("壶").join("壺").split("矿").join("礦")
    .split("制").join("製").split("优").join("優")
    .split("龙").join("龍").split("宠").join("寵")
    .split("艺").join("藝").split("传").join("傳");
  return result;
}

function cleanTitle(rawTitle) {
  let t = rawTitle;
  for (const w of MARKETING_STOPWORDS) {
    t = t.replace(new RegExp(w, "g"), "");
  }
  t = t.replace(/[（(][^）)]*[）)]/g, "");
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/^[，。、！？：；,\.\!\?\:\;]+/, "");
  return t;
}

function buildOptimizedTitle(cleaned, specs) {
  const specParts = [];
  if (specs.capacity) specParts.push(specs.capacity);
  if (specs.clay) specParts.push(specs.clay);
  if (specs.craft) specParts.push(specs.craft);

  let titleCN = cleaned;
  if (titleCN.length < 6) titleCN = "宜兴紫砂壶 " + titleCN;
  if (specParts.length > 0) {
    for (const s of specParts) {
      if (!titleCN.includes(s)) titleCN += " " + s;
    }
  }
  if (!titleCN.includes("壶") && !titleCN.includes("杯") && !titleCN.includes("茶宠") && !titleCN.includes("茶具") && !titleCN.includes("套装")) {
    titleCN = "宜兴紫砂 " + titleCN;
  }
  return {
    zhCN: titleCN.replace(/\s+/g, " ").trim(),
    zhTW: toTraditional(titleCN).replace(/\s+/g, " ").trim(),
  };
}

// ─── 描述重写引擎 ──────────────────────────────────────
const CULTURAL_INTROS = [
  "「人间珠玉安足取，岂如阳羡溪头一丸土」—— 宜兴紫砂，千年传承的茶道之魂。",
  "紫砂壶，承茶道之精髓，融匠人之心血。一把好壶，是茶席上的灵魂。",
  "宜兴紫砂，自明代肇始，历六百载而不衰。每一把壶，都是泥土与火焰的对话。",
];

function buildDescription(product, specs) {
  const introCN = CULTURAL_INTROS[Math.floor(Math.random() * CULTURAL_INTROS.length)];
  const introTW = toTraditional(introCN);
  const origDesc = product.description_zhCN || "传承经典器型，精选优质泥料，由经验丰富的匠人手工制作。每一处细节都经过反复打磨，只为呈现最纯正的紫砂之美。";

  const specLinesCN = [];
  const specLinesTW = [];
  if (specs.capacity) {
    specLinesCN.push("- 容量：" + specs.capacity + "，恰到好处的品饮体验");
    specLinesTW.push("- 容量：" + specs.capacity + "，恰到好處的品飲體驗");
  }
  if (specs.clay) {
    specLinesCN.push("- 泥料：" + specs.clay + "，优质原矿，质感温润细腻");
    specLinesTW.push("- 泥料：" + toTraditional(specs.clay) + "，優質原礦，質感溫潤細膩");
  }
  if (specs.craft) {
    specLinesCN.push("- 工艺：" + specs.craft + "，每一道工序皆见匠心");
    specLinesTW.push("- 工藝：" + toTraditional(specs.craft) + "，每一道工序皆見匠心");
  }
  if (specs.dimensions) {
    specLinesCN.push("- 尺寸：" + specs.dimensions + "，比例协调，持握舒适");
    specLinesTW.push("- 尺寸：" + specs.dimensions + "，比例協調，持握舒適");
  }

  const descCN = [
    introCN, "",
    "**" + product.title_zhCN + "**", "",
    "### 产品亮点",
    origDesc, "",
    "### 规格参数",
    specLinesCN.join("\n"), "",
    "### 适用场景",
    "- 日常品茗：与三五好友共品一壶好茶",
    "- 茶席雅集：为您的茶席增添一份东方美学",
    "- 礼赠亲友：精美包装，传递心意与品味",
    "- 个人收藏：匠人手作，每一把都是独一无二的艺术品", "",
    "### 养护小贴士",
    "1. 新壶使用前，建议用茶水煮沸30分钟以\"开壶\"",
    "2. 使用后及时清洗，保持壶内干爽",
    "3. 一壶一茶，让紫砂充分吸附茶香，日久生香",
    "4. 避免磕碰，存放于通风干燥处", "",
    "每件商品均附赠精美礼盒包装，是自用收藏与馈赠亲友的上佳之选。",
  ].join("\n");

  const descTW = [
    introTW, "",
    "**" + product.title_zhTW + "**", "",
    "### 產品亮點",
    toTraditional(origDesc), "",
    "### 規格參數",
    specLinesTW.join("\n"), "",
    "### 適用場景",
    "- 日常品茗：與三五好友共品一壺好茶",
    "- 茶席雅集：為您的茶席增添一份東方美學",
    "- 禮贈親友：精美包裝，傳遞心意與品味",
    "- 個人收藏：匠人手作，每一把都是獨一無二的藝術品", "",
    "### 養護小貼士",
    "1. 新壺使用前，建議用茶水煮沸30分鐘以\"開壺\"",
    "2. 使用後及時清洗，保持壺內乾爽",
    "3. 一壺一茶，讓紫砂充分吸附茶香，日久生香",
    "4. 避免磕碰，存放於通風乾燥處", "",
    "每件商品均附贈精美禮盒包裝，是自用收藏與饋贈親友的上佳之選。",
  ].join("\n");

  return { zhCN: descCN, zhTW: descTW };
}

// ─── 定价引擎 ──────────────────────────────────────────
const PRICE_BRACKETS = [
  { rmbMin: 0, rmbMax: 100, usdMin: 19, usdMax: 39, label: "配件/小件" },
  { rmbMin: 100, rmbMax: 300, usdMin: 39, usdMax: 79, label: "入门级茶具" },
  { rmbMin: 300, rmbMax: 800, usdMin: 79, usdMax: 169, label: "中端壶/套装" },
  { rmbMin: 800, rmbMax: 2000, usdMin: 169, usdMax: 399, label: "中高端手工壶" },
  { rmbMin: 2000, rmbMax: Infinity, usdMin: 399, usdMax: 999, label: "高端/大师级" },
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

// ─── ID 生成 ───────────────────────────────────────────
function generateProductId(prefix) {
  if (prefix === undefined) prefix = "zp";
  var maxNum = 0;
  try {
    if (fs.existsSync(OUT_DIR)) {
      fs.readdirSync(OUT_DIR).forEach(function(f) {
        if (f.endsWith(".json")) {
          var data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf-8"));
          var m = data.id.match(new RegExp(prefix + "-(\\\\d+)"));
          if (m) { maxNum = Math.max(maxNum, parseInt(m[1])); }
        }
      });
    }
  } catch (e) {}
  return prefix + "-" + String(maxNum + 1).padStart(3, "0");
}

function generateSlug(titleCN) {
  return titleCN.toLowerCase()
    .replace(/[^a-z0-9\\u4e00-\\u9fff]+/g, "-")
    .replace(/^-|-\$/g, "")
    .replace(/-+/g, "-");
}

// ─── 数据读写 ──────────────────────────────────────────
function writeProcessedProduct(product) {
  var filePath = path.join(OUT_DIR, product.id + ".json");
  fs.writeFileSync(filePath, JSON.stringify(product, null, 2), "utf-8");
  console.log("  ✓ 已写入: " + path.relative(process.cwd(), filePath));
  return filePath;
}

// ─── 核心处理函数 ──────────────────────────────────────
function processRawProduct(raw) {
  var cleaned = cleanTitle(raw.source_title || "");
  var category = detectCategory(cleaned, raw.category);
  var specs = raw.specs || {};
  var titles = buildOptimizedTitle(cleaned, specs);
  var pricing = calculatePrice(raw.source_price || 0);

  var productBase = {
    id: generateProductId(),
    slug: generateSlug(titles.zhCN),
    title_zhCN: titles.zhCN,
    title_zhTW: titles.zhTW,
    description_zhCN: "",
    description_zhTW: "",
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    images: (raw.source_images || []).slice(0, 6),
    category: category,
    inStock: raw.inStock !== false,
    stock: raw.stock || 10,
    featured: raw.featured || false,
    specs: specs,
    createdAt: new Date().toISOString().split("T")[0],
    rating: 0,
    reviewCount: 0,
    _pricing: pricing,
  };

  var descriptions = buildDescription(productBase, specs);
  productBase.description_zhCN = descriptions.zhCN;
  productBase.description_zhTW = descriptions.zhTW;

  return productBase;
}

// ─── Shopify CSV 导出 ─────────────────────────────────
function esc(v) {
  if (v == null) return "";
  var s = String(v);
  if (s.indexOf(",") >= 0 || s.indexOf('"') >= 0 || s.indexOf("\\n") >= 0) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

var CSV_HEADERS = [
  "Handle","Title","Body (HTML)","Vendor","Type",
  "Tags","Published","Option1 Name","Option1 Value",
  "Variant SKU","Variant Price","Variant Compare At Price",
  "Variant Inventory Qty","Variant Inventory Policy",
  "Image Src","Image Alt Text",
];

function generateShopifyCSV(products, lang) {
  if (lang === undefined) lang = "zhCN";
  var isTW = lang === "zhTW";
  var rows = products.map(function(p) {
    var handle = isTW ? (p.slug + "-tw") : p.slug;
    var title = isTW ? p.title_zhTW : p.title_zhCN;
    var body = (isTW ? p.description_zhTW : p.description_zhCN).replace(/\\n/g, "<br>");
    var tags = ["紫砂" + (isTW ? "壺" : "壶"), "teapot", p.category, p.specs.clay || "", p.specs.craft || ""].filter(Boolean).join(", ");
    var sku = isTW ? (p.id + "-TW") : p.id;
    var alt = isTW ? p.title_zhTW : p.title_zhCN;
    return [
      handle, title, body, "紫砂雅集", p.category,
      tags, p.inStock ? "TRUE" : "FALSE", "Title", "Default Title",
      sku, p.price, p.originalPrice || "",
      p.stock, "continue",
      p.images[0] || "", alt,
    ].map(esc).join(",");
  });
  return [CSV_HEADERS.join(",")].concat(rows).join("\\n");
}

// ─── 主函数 ────────────────────────────────────────────
function main() {
  var args = process.argv.slice(2);
  var preview = args.indexOf("--preview") >= 0;
  var specificFile = null;
  for (var i = 0; i < args.length; i++) {
    if (args[i].startsWith("--file=")) { specificFile = args[i].split("=")[1]; break; }
  }

  [RAW_DIR, OUT_DIR, EXPORT_DIR].forEach(function(dir) {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
  });

  var rawFiles = [];
  if (specificFile) { rawFiles = [specificFile]; }
  else { rawFiles = fs.readdirSync(RAW_DIR).filter(function(f) { return f.endsWith(".json"); }); }

  if (rawFiles.length === 0) {
    console.log("📂 没有待处理的原始数据文件。");
    console.log("   请将原始商品 JSON 文件放入: " + RAW_DIR);
    console.log("\\n📄 示例数据格式:");
    console.log(JSON.stringify({
      source_title: "宜兴紫砂壶 功夫茶具 西施壶 260ml 手工制作",
      source_price: 298,
      source_description: "原版商品描述...",
      source_images: ["/images/products/example-1.jpg"],
      specs: { capacity: "260ml", clay: "原矿紫泥", craft: "全手工制作", dimensions: "13×9×8cm" },
      category: "teapot", stock: 15,
    }, null, 2));
    return;
  }

  var processed = [];

  rawFiles.forEach(function(rf) {
    var filePath = path.join(RAW_DIR, rf);
    var rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    var items = Array.isArray(rawData) ? rawData : [rawData];

    items.forEach(function(item) {
      console.log("\\n── 处理: " + (item.source_title || rf) + " ──");
      var product = processRawProduct(item);

      if (preview) {
        console.log("  ID: " + product.id);
        console.log("  Slug: " + product.slug);
        console.log("  标题(简): " + product.title_zhCN);
        console.log("  标题(繁): " + product.title_zhTW);
        console.log("  定价: ¥" + item.source_price + " → $" + product.price + " USD");
        if (product.originalPrice) console.log("  划线价: $" + product.originalPrice + " USD");
        console.log("  品类: " + product.category);
        console.log("  库存: " + product.stock);
        console.log("  系数: " + product._pricing.coefficient + "x");
        console.log("  价格区间: " + product._pricing.bracket);
      } else {
        writeProcessedProduct(product);
        processed.push(product);
      }
    });
  });

  if (!preview && processed.length > 0) {
    var ts = Date.now();
    var csvCN = generateShopifyCSV(processed, "zhCN");
    var csvCNPath = path.join(EXPORT_DIR, "shopify-export-zhCN-" + ts + ".csv");
    fs.writeFileSync(csvCNPath, "\\uFEFF" + csvCN, "utf-8");
    console.log("\\n📊 已生成 Shopify CSV (简中): " + path.relative(process.cwd(), csvCNPath));

    var csvTW = generateShopifyCSV(processed, "zhTW");
    var csvTWPath = path.join(EXPORT_DIR, "shopify-export-zhTW-" + ts + ".csv");
    fs.writeFileSync(csvTWPath, "\\uFEFF" + csvTW, "utf-8");
    console.log("📊 已生成 Shopify CSV (繁中): " + path.relative(process.cwd(), csvTWPath));

    console.log("\\n✅ 共处理 " + processed.length + " 件商品");
  }

  if (preview) {
    console.log("\\n👀 预览模式完成。移除 --preview 参数以实际输出文件。");
  }
}

main();
