const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_DIR = "D:\\图快下载器\\淘宝采集";
const OUTPUT_BASE = path.join(__dirname, "..", "public", "images", "products");
const TARGET_SIZE = 1200;
const QUALITY = 85;

const PRODUCTS = [
  {
    id: "tk-001",
    folder: "00_古悦堂 宜兴紫砂壶套装纯手工正宗家用茶壶功夫茶具泡茶壶归兽壶",
    mainImages: ["主图_1.jpg", "主图_2.jpg", "主图_3.jpg"],
    variants: [
      { file: "11_单壶.jpg",  name: "danhu" },
      { file: "12_一壶四杯.jpg", name: "1hu4bei" },
      { file: "13_一壶六杯.jpg", name: "1hu6bei" },
    ],
    detailImages: [],
    hasVideo: false,
  },
  {
    id: "tk-002",
    folder: "00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶",
    mainImages: ["主图_1.jpg", "主图_2.jpg", "主图_3.jpg", "主图_4.jpg", "主图_5.jpg"],
    variants: [
      { file: "11_彩绘款单壶 约240ml【以此为准】.jpg",  name: "caihui_danhu" },
      { file: "12_刻绘款单壶 约240ml【以此为准】.jpg",  name: "kehui_danhu" },
      { file: "13_素颜款单壶 约240ml【以此为准】.jpg",  name: "suyan_danhu" },
      { file: "14_彩绘款大套装 约240ml【以此为准】.jpg",  name: "caihui_set" },
      { file: "15_刻绘款大套装 约240ml【以此为准】.jpg",  name: "kehui_set" },
      { file: "16_素颜款大套装 约240ml【以此为准】.jpg",  name: "suyan_set" },
    ],
    detailImages: [
      "详情_1.jpg","详情_2.jpg","详情_3.jpg","详情_4.jpg","详情_5.jpg",
      "详情_6.jpg","详情_7.jpg","详情_8.jpg","详情_9.jpg","详情_10.jpg",
      "详情_11.jpg","详情_12.jpg","详情_13.jpg","详情_14.jpg","详情_15.jpg",
      "详情_16.jpg","详情_17.jpg","详情_18.jpg","详情_19.jpg","详情_20.jpg",
      "详情_21.jpg","详情_22.jpg","详情_23.jpg",
    ],
    hasVideo: true,
  },
];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + "KB";
  return (bytes/(1024*1024)).toFixed(1) + "MB";
}

async function processImage(srcPath, outputPath, label) {
  try {
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const overlaySvg = '<svg width="' + TARGET_SIZE + '" height="' + TARGET_SIZE + '">' +
      '<rect x="0" y="' + (TARGET_SIZE - 80) + '" width="320" height="80" fill="white" opacity="1"/>' +
      '<rect x="' + (TARGET_SIZE - 320) + '" y="' + (TARGET_SIZE - 80) + '" width="320" height="80" fill="white" opacity="1"/>' +
      '</svg>';

    const resized = await sharp(srcPath)
      .resize({ width: TARGET_SIZE, height: TARGET_SIZE, fit: "cover", position: "center" })
      .toColorspace("srgb")
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();

    await sharp(resized)
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(outputPath);

    const outSize = fs.statSync(outputPath).size;
    console.log("  \u2713 " + label + " \u2192 " + path.basename(outputPath) + " (" + formatSize(outSize) + ")");
    return true;
  } catch (err) {
    try {
      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      await sharp(srcPath)
        .resize({ width: TARGET_SIZE, height: TARGET_SIZE, fit: "cover", position: "center" })
        .toColorspace("srgb")
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(outputPath);
      const outSize = fs.statSync(outputPath).size;
      console.log("  ~ " + label + " \u2192 " + path.basename(outputPath) + " (" + formatSize(outSize) + ") [\u65e0\u53e0\u52a0\u5c42]");
      return true;
    } catch (fallbackErr) {
      console.log("  \u2717 " + label + " \u2014 " + fallbackErr.message);
      return false;
    }
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  \u5546\u54c1\u56fe\u7247\u5904\u7406 \u2014 \u53bb\u6c34\u5370\xb71200\xd71200\xb7WebP");
  console.log("═══════════════════════════════════════════════════\n");

  let total = 0;
  let success = 0;

  for (const prod of PRODUCTS) {
    const srcDir = path.join(SOURCE_DIR, prod.folder);
    if (!fs.existsSync(srcDir)) {
      console.log("\u26a0 \u76ee\u5f55\u4e0d\u5b58\u5728\uff0c\u8df3\u8fc7: " + srcDir + "\n");
      continue;
    }

    console.log("\u2500\u2500 " + prod.id + " (" + prod.folder + ") \u2500\u2500\n");

    for (const [idx, file] of prod.mainImages.entries()) {
      total++;
      const src = path.join(srcDir, file);
      if (!fs.existsSync(src)) { console.log("  \u2717 \u6587\u4ef6\u4e0d\u5b58\u5728: " + file); continue; }
      const outName = "main_" + (idx + 1) + ".webp";
      const outPath = path.join(OUTPUT_BASE, prod.id, outName);
      if (await processImage(src, outPath, "\u4e3b\u56fe " + (idx + 1))) success++;
    }

    for (const v of prod.variants) {
      total++;
      const src = path.join(srcDir, v.file);
      if (!fs.existsSync(src)) { console.log("  \u2717 \u6587\u4ef6\u4e0d\u5b58\u5728: " + v.file); continue; }
      const outName = "variant_" + v.name + ".webp";
      const outPath = path.join(OUTPUT_BASE, prod.id, outName);
      if (await processImage(src, outPath, "\u53d8\u4f53 " + v.name)) success++;
    }

    for (const [idx, file] of prod.detailImages.entries()) {
      total++;
      const src = path.join(srcDir, file);
      if (!fs.existsSync(src)) { console.log("  \u2717 \u6587\u4ef6\u4e0d\u5b58\u5728: " + file); continue; }
      const outName = "detail_" + (idx + 1) + ".webp";
      const outPath = path.join(OUTPUT_BASE, prod.id, outName);
      if (await processImage(src, outPath, "\u8be6\u60c5 " + (idx + 1))) success++;
    }

    if (prod.hasVideo) {
      const videoSrc = path.join(srcDir, "1.mp4");
      if (fs.existsSync(videoSrc)) {
        const videoDir = path.join(path.dirname(OUTPUT_BASE), "videos", prod.id);
        if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
        fs.copyFileSync(videoSrc, path.join(videoDir, "main.mp4"));
        console.log("  \u2713 \u89c6\u9891 \u2192 videos/" + prod.id + "/main.mp4 (" + formatSize(fs.statSync(videoSrc).size) + ")");
      }
    }

    console.log("");
  }

  console.log("═══════════════════════════════════════════════════");
  console.log("  \u5904\u7406\u5b8c\u6210: " + success + "/" + total + " \u5f20\u56fe\u7247\u6210\u529f");
  console.log("  \u8f93\u51fa\u76ee\u5f55: " + OUTPUT_BASE);
  console.log("═══════════════════════════════════════════════════");
}

main().catch(e => { console.error("\u81f4\u547d\u9519\u8bef:", e.message); process.exit(1); });
