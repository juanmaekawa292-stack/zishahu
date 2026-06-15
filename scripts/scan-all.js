const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const WATERMARK_ZONES = [
  { name: "bottom-left",  x: 0,   y: -70, w: 300, h: 70, desc: "左下角店铺品牌名" },
  { name: "bottom-right", x: -300, y: -70, w: 300, h: 70, desc: "右下角平台Logo" },
];
const WHITE_THRESHOLD = 230;
const MIN_NONWHITE_RATIO = 0.05;
const MIN_EDGE_RATIO = 0.02;

async function detectWatermark(filePath) {
  const basename = path.basename(filePath);
  try {
    const meta = await sharp(filePath).metadata();
    const w = meta.width, h = meta.height;
    if (!w || !h) return { file: basename, hasWatermark: false, confidence: 0, zones: [] };
    const zoneResults = [];
    for (const zone of WATERMARK_ZONES) {
      const rx = zone.x >= 0 ? zone.x : w + zone.x;
      const ry = zone.y >= 0 ? zone.y : h + zone.y;
      const rw = Math.min(zone.w, w - rx);
      const rh = Math.min(zone.h, h - ry);
      if (rw <= 0 || rh <= 0) { zoneResults.push({ name: zone.name, available: false }); continue; }
      const buf = await sharp(filePath).extract({ left: rx, top: ry, width: rw, height: rh }).raw().toBuffer();
      let total = buf.length / 3, nonWhite = 0, edges = 0;
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = (y * rw + x) * 3;
          const r = buf[idx], g = buf[idx+1], b = buf[idx+2];
          if (!(r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD)) nonWhite++;
          if (x < rw - 1) {
            const bn = (buf[idx+3]+buf[idx+4]+buf[idx+5])/3;
            if (Math.abs((r+g+b)/3 - bn) > 40) edges++;
          }
        }
      }
      const nwr = nonWhite/total, er = edges/total;
      const hw = nwr > MIN_NONWHITE_RATIO && er > MIN_EDGE_RATIO;
      const conf = hw ? Math.min(1, (nwr/0.3)*0.6 + (er/0.1)*0.4) : 0;
      zoneResults.push({ name: zone.name, desc: zone.desc, hasWatermark: hw, confidence: Math.round(conf*100)/100 });
    }
    const any = zoneResults.some(z => z.available !== false && z.hasWatermark);
    const avgConf = zoneResults.filter(z => z.available !== false).reduce((s,z) => s+z.confidence, 0) / zoneResults.filter(z => z.available !== false).length;
    return { file: basename, fullPath: filePath, hasWatermark: any, confidence: Math.round(avgConf*100)/100, zones: zoneResults };
  } catch(e) {
    return { file: basename, fullPath: filePath, hasWatermark: false, confidence: 0, zones: [], error: e.message };
  }
}

async function main() {
  const baseDir = "D:\\图快下载器\\淘宝采集\\0615";
  const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  let allFiles = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.isFile() && imageExts.has(path.extname(e.name).toLowerCase())) allFiles.push(fp);
    }
  }
  walk(baseDir);

  const groups = {};
  for (const fp of allFiles) {
    const dirName = path.basename(path.dirname(fp));
    if (!groups[dirName]) groups[dirName] = [];
    groups[dirName].push(fp);
  }

  for (const [product, files] of Object.entries(groups)) {
    console.log("================================================================");
    console.log("商品: " + product);
    console.log("图片数: " + files.length + " 张");
    console.log("");
    const results = await Promise.all(files.map(f => detectWatermark(f)));
    const wm = results.filter(r => r.hasWatermark);
    const cl = results.filter(r => !r.hasWatermark && !r.error);
    console.log("  [有水印] " + wm.length + " 张:");
    for (const r of wm) {
      const zones = r.zones.filter(z => z.available !== false && z.hasWatermark).map(z => z.desc).join(" + ");
      console.log("    ⚠️ " + r.file + " (置信度" + (r.confidence*100).toFixed(0) + "%) — " + zones);
    }
    console.log("");
    console.log("  [干净] " + cl.length + " 张:");
    for (const r of cl) {
      console.log("    ✅ " + r.file);
    }
    console.log("");
  }

  console.log("================================================================");
  const allResults = (await Promise.all(allFiles.map(f => detectWatermark(f))));
  const totalWm = allResults.filter(r => r.hasWatermark).length;
  const totalCl = allResults.filter(r => !r.hasWatermark && !r.error).length;
  const totalErr = allResults.filter(r => r.error).length;
  console.log("汇总统计: 总" + allResults.length + "张 | 有水印" + totalWm + " | 干净" + totalCl + " | 失败" + totalErr);
}
main().catch(e => { console.error(e); process.exit(1); });
