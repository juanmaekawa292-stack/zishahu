const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_JSON = path.join(__dirname, "..", "data", "source_products.json");
const IMG_OUT = path.join(__dirname, "..", "public", "images", "products");
const VIDEO_OUT = path.join(__dirname, "..", "public", "videos", "products");
const PRODUCTS_TS = path.join(__dirname, "..", "src", "data", "products.ts");

const TARGET_W = 1200;
const TARGET_H = 1200;
const QUALITY = 85;

function priceAfter10x(rmbPrice) {
  const raw = (rmbPrice * 10) / 7.25;
  let final = Math.round(raw);
  final = Math.floor(final / 10) * 10 + 9;
  if (final < 9) final = Math.round(raw);
  return final;
}

async function removeWatermark(image, meta) {
  const w = meta.width;
  const h = meta.height;

  if (w < 300 || h < 300) return image;

  // Watermark is in bottom-right corner of 750x1000 images
  const wmWidth = Math.round(w * 0.22);
  const wmHeight = Math.round(h * 0.055);
  const wmLeft = w - wmWidth;
  const wmTop = h - wmHeight;

  // Sample area just above watermark (content-aware fill)
  const sampleTop = Math.max(0, wmTop - wmHeight);
  if (sampleTop < 10) return image;

  const sampleBuffer = await image
    .clone()
    .extract({ left: wmLeft, top: sampleTop, width: wmWidth, height: wmHeight })
    .toBuffer();

  return image.composite([{
    input: sampleBuffer,
    top: wmTop,
    left: wmLeft,
    blend: 'over',
  }]);
}

async function processImages(sourceImages, productSlug) {
  const results = [];
  for (let i = 0; i < sourceImages.length; i++) {
    const srcPath = sourceImages[i];
    const ext = path.extname(srcPath).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

    const baseName = productSlug + "-" + (i + 1) + ".webp";
    const outPath = path.join(IMG_OUT, baseName);

    process.stdout.write("  [" + (i + 1) + "/" + sourceImages.length + "] " + path.basename(srcPath) + " -> " + baseName + " ... ");

    try {
      let img = sharp(srcPath);
      let meta = await img.metadata();

      // Watermark removal
      img = await removeWatermark(img, meta);

      // Resize to 1200x1200
      img = img.resize({
        width: TARGET_W, height: TARGET_H,
        fit: "cover", position: "center",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      });

      // Flatten with white background
      img = img.flatten({ background: { r: 255, g: 255, b: 255 } });

      await img.webp({ quality: QUALITY, effort: 4 }).toFile(outPath);

      results.push("/images/products/" + baseName);
      const size = fs.statSync(outPath).size;
      console.log((size / 1024).toFixed(1) + " KB");
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  }
  return results;
}

function generateProductsTS(products, imageMap) {
  const lines = [];
  lines.push("import { Product } from \"@/types\";");
  lines.push("");
  lines.push("export const products: Product[] = [");

  for (const p of products) {
    const images = imageMap[p.id] || [];
    const avgPrice = Math.round(p.variants.reduce((s, v) => s + v.price, 0) / p.variants.length);
    const maxOrig = Math.max(...p.variants.map(v => v.original_price));
    const price = priceAfter10x(avgPrice);
    const origPrice = priceAfter10x(maxOrig);

    lines.push("  {");
    lines.push("    id: \"" + p.id + "\",");
    lines.push("    slug: \"" + p.slug + "\",");
    lines.push("    title_zhCN: \"" + p.title_zhCN + "\",");
    lines.push("    title_zhTW: \"" + p.title_zhTW + "\",");
    lines.push("    description_zhCN: \"\",");
    lines.push("    description_zhTW: \"\",");
    lines.push("    price: " + price + ",");
    lines.push("    originalPrice: " + origPrice + ",");
    lines.push("    images: " + JSON.stringify(images) + ",");
    lines.push("    category: \"" + p.category + "\",");
    lines.push("    inStock: true,");
    lines.push("    stock: 100,");
    lines.push("    featured: " + (p.id === "tk-001" ? "true" : "false") + ",");
    lines.push("    specs: " + JSON.stringify(p.specs) + ",");
    lines.push("    createdAt: \"" + new Date().toISOString().split("T")[0] + "\",");
    lines.push("    rating: 4.8,");
    lines.push("    reviewCount: 0,");
    lines.push("    sourceUrl: \"" + p.source_url + "\",");
    lines.push("    sourceSku: \"" + p.source_sku + "\",");
    lines.push("    videos: " + JSON.stringify(p.videosOut || []) + ",");
    lines.push("  },");
  }

  lines.push("];");
  lines.push("");
  lines.push("export const categories = [");
  lines.push("  { key: \"all\", label_zhCN: \"全部\" },");
  lines.push("  { key: \"teapot\", label_zhCN: \"紫砂壶\" },");
  lines.push("  { key: \"cup\", label_zhCN: \"茶杯\" },");
  lines.push("  { key: \"teaPet\", label_zhCN: \"茶宠\" },");
  lines.push("  { key: \"teaTool\", label_zhCN: \"茶具配件\" },");
  lines.push("  { key: \"gift\", label_zhCN: \"礼品套装\" },");
  lines.push("];");
  lines.push("");
  lines.push("export function getProductBySlug(slug: string) {");
  lines.push("  return products.find(function(p) { return p.slug === slug; });");
  lines.push("}");
  lines.push("");
  lines.push("export const countries = [");
  lines.push("  { code: \"US\", name_zhCN: \"美国\", name_zhTW: \"美國\" },");
  lines.push("  { code: \"CA\", name_zhCN: \"加拿大\", name_zhTW: \"加拿大\" },");
  lines.push("  { code: \"GB\", name_zhCN: \"英国\", name_zhTW: \"英國\" },");
  lines.push("  { code: \"AU\", name_zhCN: \"澳大利亚\", name_zhTW: \"澳大利亞\" },");
  lines.push("  { code: \"SG\", name_zhCN: \"新加坡\", name_zhTW: \"新加坡\" },");
  lines.push("  { code: \"MY\", name_zhCN: \"马来西亚\", name_zhTW: \"馬來西亞\" },");
  lines.push("  { code: \"TW\", name_zhCN: \"台湾\", name_zhTW: \"台灣\" },");
  lines.push("  { code: \"HK\", name_zhCN: \"香港\", name_zhTW: \"香港\" },");
  lines.push("  { code: \"DE\", name_zhCN: \"德国\", name_zhTW: \"德國\" },");
  lines.push("  { code: \"FR\", name_zhCN: \"法国\", name_zhTW: \"法國\" },");
  lines.push("  { code: \"JP\", name_zhCN: \"日本\", name_zhTW: \"日本\" },");
  lines.push("  { code: \"KR\", name_zhCN: \"韩国\", name_zhTW: \"韓國\" },");
  lines.push("];");

  return lines.join("\n");
}

async function copyVideo(srcPath, productId) {
  if (!srcPath || !fs.existsSync(srcPath)) return "";
  const ext = path.extname(srcPath);
  const destName = productId + ext;
  const destPath = path.join(VIDEO_OUT, destName);
  if (!fs.existsSync(VIDEO_OUT)) fs.mkdirSync(VIDEO_OUT, { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.log("  Video: " + destName + " (" + (fs.statSync(destPath).size / 1024 / 1024).toFixed(1) + " MB)");
  return "/videos/products/" + destName;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(SOURCE_JSON, "utf-8"));
  const products = data.products;
  const imageMap = {};

  console.log("=== Processing Upload Batch ===");
  console.log("Products: " + products.length + "\n");

  for (const p of products) {
    console.log("-- " + p.title_zhCN + " --");

    if (!fs.existsSync(IMG_OUT)) fs.mkdirSync(IMG_OUT, { recursive: true });

    const webpPaths = await processImages(p.images, p.slug);
    imageMap[p.id] = webpPaths;
    console.log("  Images: " + webpPaths.length + " processed\n");

    p.videosOut = [];
    if (p.videos && p.videos.length > 0) {
      const videoPath = await copyVideo(p.videos[0], p.id);
      if (videoPath) p.videosOut.push(videoPath);
    }
  }

  console.log("\n=== Generating products.ts ===");
  const tsContent = generateProductsTS(products, imageMap);
  fs.writeFileSync(PRODUCTS_TS, tsContent, "utf-8");
  console.log("Written: " + PRODUCTS_TS);

  console.log("\n=== Done ===");
  console.log("Products: " + products.length);
}

main().catch(function(e) { console.error("Fatal:", e.message); process.exit(1); });
