const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// ──── 水印检测区域配置 ──────────────
const WATERMARK_ZONES = [
  { name: "bottom-left",  x: 0,   y: -70, w: 300, h: 70, desc: "左下角店铺品牌名" },
  { name: "bottom-right", x: -300, y: -70, w: 300, h: 70, desc: "右下角平台Logo" },
];

const WHITE_THRESHOLD = 230;
const MIN_NONWHITE_RATIO = 0.05;
const MIN_EDGE_RATIO = 0.02;

async function detectWatermark(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp", ".tiff"].includes(ext)) {
    return { file: basename, fullPath: filePath, hasWatermark: false, confidence: 0, zones: [], error: "Unsupported format" };
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const w = metadata.width;
    const h = metadata.height;
    if (!w || !h) return { file: basename, fullPath: filePath, hasWatermark: false, confidence: 0, zones: [] };

    const zoneResults = [];

    for (const zone of WATERMARK_ZONES) {
      const rx = zone.x >= 0 ? zone.x : w + zone.x;
      const ry = zone.y >= 0 ? zone.y : h + zone.y;
      const rw = Math.min(zone.w, w - rx);
      const rh = Math.min(zone.h, h - ry);

      if (rw <= 0 || rh <= 0) {
        zoneResults.push({ name: zone.name, available: false, reason: "区域超出图片边界" });
        continue;
      }

      const rawBuffer = await sharp(filePath)
        .extract({ left: rx, top: ry, width: rw, height: rh })
        .raw()
        .toBuffer();

      let totalPixels = rawBuffer.length / 3;
      let nonWhitePixels = 0;
      let edgePixels = 0;

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = (y * rw + x) * 3;
          const r = rawBuffer[idx];
          const g = rawBuffer[idx + 1];
          const b = rawBuffer[idx + 2];

          const isWhite = r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD;
          if (!isWhite) nonWhitePixels++;

          if (x < rw - 1) {
            const rn = rawBuffer[idx + 3], gn = rawBuffer[idx + 4], bn = rawBuffer[idx + 5];
            const brightness = (r + g + b) / 3;
            const brightnessNext = (rn + gn + bn) / 3;
            if (Math.abs(brightness - brightnessNext) > 40) edgePixels++;
          }
        }
      }

      const nonWhiteRatio = nonWhitePixels / totalPixels;
      const edgeRatio = edgePixels / totalPixels;

      const hasContent = nonWhiteRatio > MIN_NONWHITE_RATIO;
      const hasEdges = edgeRatio > MIN_EDGE_RATIO;
      const hasWatermark = hasContent && hasEdges;

      let confidence = 0;
      if (hasWatermark) {
        confidence = Math.min(1.0, (nonWhiteRatio / 0.3) * 0.6 + (edgeRatio / 0.1) * 0.4);
      }

      zoneResults.push({
        name: zone.name,
        available: true,
        desc: zone.desc,
        hasWatermark,
        confidence: Math.round(confidence * 100) / 100,
        nonWhiteRatio: Math.round(nonWhiteRatio * 100) / 100,
        edgeRatio: Math.round(edgeRatio * 100) / 100,
      });
    }

    const anyWatermark = zoneResults.some(z => z.available && z.hasWatermark);
    const avgConfidence = zoneResults
      .filter(z => z.available)
      .reduce((sum, z) => sum + z.confidence, 0) / zoneResults.filter(z => z.available).length;

    return {
      file: basename,
      fullPath: filePath,
      hasWatermark: anyWatermark,
      confidence: Math.round(avgConfidence * 100) / 100,
      zones: zoneResults,
      dimensions: `${w}x${h}`,
    };

  } catch (err) {
    return { file: basename, fullPath: filePath, hasWatermark: false, confidence: 0, zones: [], error: err.message };
  }
}

// ──── 主逻辑 ──────────────
async function main() {
  const baseDir = "D:\\图快下载器\\淘宝采集\\0615";
  if (!fs.existsSync(baseDir)) {
    console.error("目录不存在:", baseDir);
    process.exit(1);
  }

  // 递归找所有图片
  const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".tiff"]);
  let allFiles = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && imageExts.has(path.extname(entry.name).toLowerCase())) {
        allFiles.push(fullPath);
      }
    }
  }
  walkDir(baseDir);

  console.log("=== 水印检测报告 ===");
  console.log(`源目录: ${baseDir}`);
  console.log(`找到图片: ${allFiles.length} 张`);
  console.log("");

  // 按商品文件夹分组检测
  const productGroups = {};
  for (const fp of allFiles) {
    const dirName = path.basename(path.dirname(fp));
    if (!productGroups[dirName]) productGroups[dirName] = [];
    productGroups[dirName].push(fp);
  }

  let totalWatermarked = 0;
  let totalClean = 0;

  for (const [product, files] of Object.entries(productGroups)) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📦 商品: ${product}`);
    console.log(`   图片数: ${files.length} 张`);
    console.log("");

    const results = await Promise.all(files.map(f => detectWatermark(f)));
    const watermarked = results.filter(r => r.hasWatermark);
    const clean = results.filter(r => !r.hasWatermark && !r.error);

    totalWatermarked += watermarked.length;
    totalClean += clean.length;

    if (watermarked.length > 0) {
      console.log(`   🔶 有水印 (${watermarked.length} 张):`);
      for (const r of watermarked) {
        console.log(`      - ${r.file}`);
        for (const z of r.zones) {
          if (z.available) {
            console.log(`        ${z.name}: ${z.hasWatermark ? "⚠️有标记" : "✅干净"} (置信度:${(z.confidence*100).toFixed(0)}%) → ${z.desc}`);
          }
        }
      }
    }

    if (clean.length > 0) {
      console.log(`   ✅ 干净 (${clean.length} 张):`);
      for (const r of clean) {
        console.log(`      - ${r.file}`);
      }
    }

    // 写入每个商品的详细报告
    const reportDir = path.join(baseDir, "..", "watermark_reports");
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    const safeName = product.replace(/[<>:"/\\|?*]/g, "_");
    fs.writeFileSync(
      path.join(reportDir, `${safeName}.json`),
      JSON.stringify(results, null, 2)
    );

    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 汇总统计");
  console.log(`   总图片: ${allFiles.length} 张`);
  console.log(`   🔶 有水印: ${totalWatermarked} 张`);
  console.log(`   ✅ 干净: ${totalClean} 张`);
  console.log(`   ❌ 检测失败: ${allFiles.length - totalWatermarked - totalClean} 张`);
  console.log("\n详细报告已保存到:", path.join(baseDir, "..", "watermark_reports"));

  // 生成全局JSON
  const allResults = [];
  for (const [product, files] of Object.entries(productGroups)) {
    const results = await Promise.all(files.map(f => detectWatermark(f)));
    allResults.push({ product, images: results });
  }
  fs.writeFileSync(
    path.join(reportDir, "_all_products.json"),
    JSON.stringify(allResults, null, 2)
  );
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
