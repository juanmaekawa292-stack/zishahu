/**
 * 姘村嵃妫€娴嬭剼鏈?鈥?闆禔I锛岀函鍥惧儚鍒嗘瀽锛岄浂token娑堣€? *
 * 妫€娴嬪師鐞嗭細
 * 鐢靛晢鍟嗗搧鍥剧殑姘村嵃閫氬父鍑虹幇鍦ㄥ浐瀹氫綅缃細
 *   - 宸︿笅瑙? 搴楅摵鍝佺墝鍚嶏紙鍙ゆ偊鍫傜瓑锛? *   - 鍙充笅瑙? 澶╃尗/娣樺疂Logo
 * 妫€娴嬫柟娉曪細鍒嗘瀽杩欎袱涓尯鍩熸槸鍚︽湁闈炶儗鏅壊鐨勬枃瀛?Logo鍍忕礌
 *
 * 浣跨敤鏂瑰紡锛? *   node scripts/detect-watermark.js                    # 妫€娴?data/images/input/ 涓嬫墍鏈夊浘鐗? *   node scripts/detect-watermark.js --file=xxx.jpg     # 妫€娴嬪崟寮? *   node scripts/detect-watermark.js --auto-remove      # 妫€娴嬪悗鑷姩鍘绘按鍗? *
 * 杈撳嚭锛欽SON鏁扮粍锛屾瘡椤瑰寘鍚?{ file, hasWatermark, confidence, zones }
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 鈹€鈹€鈹€ 姘村嵃妫€娴嬪尯鍩熼厤缃?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// 閽堝娣樺疂/澶╃尗鍟嗗搧鍥剧殑姘村嵃浣嶇疆
const WATERMARK_ZONES = [
  { name: "bottom-left",  x: 0,   y: -70, w: 300, h: 70, desc: "宸︿笅瑙掑簵閾哄搧鐗屽悕" },
  { name: "bottom-right", x: -300, y: -70, w: 300, h: 70, desc: "鍙充笅瑙掑钩鍙癓ogo" },
];

// 鍒ゆ柇鏄惁"闈炴按鍗?鐨勯槇鍊?const WHITE_THRESHOLD = 230;   // RGB姣忎釜閫氶亾 > 230 瑙嗕负鐧?鑳屾櫙
const MIN_NONWHITE_RATIO = 0.05;  // 鍖哄煙涓?>5% 闈炵櫧鑹?鈫?鍙兘鏈夋按鍗?const MIN_EDGE_RATIO = 0.02;      // 鍖哄煙涓?>2% 杈圭紭鍍忕礌 鈫?鏂囧瓧/Logo

// 鈹€鈹€鈹€ 鏍稿績妫€娴嬪嚱鏁?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
async function detectWatermark(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp", ".tiff"].includes(ext)) {
    return { file: basename, hasWatermark: false, confidence: 0, zones: [], error: "Unsupported format" };
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const w = metadata.width;
    const h = metadata.height;
    if (!w || !h) return { file: basename, hasWatermark: false, confidence: 0, zones: [] };

    const zoneResults = [];

    for (const zone of WATERMARK_ZONES) {
      // 璁＄畻瀹為檯鍍忕礌鍧愭爣锛堟敮鎸佽礋鏁?= 浠庡簳閮?鍙充晶绠楄捣锛?      const rx = zone.x >= 0 ? zone.x : w + zone.x;
      const ry = zone.y >= 0 ? zone.y : h + zone.y;
      const rw = Math.min(zone.w, w - rx);
      const rh = Math.min(zone.h, h - ry);

      if (rw <= 0 || rh <= 0) {
        zoneResults.push({ name: zone.name, available: false, reason: "鍖哄煙瓒呭嚭鍥剧墖杈圭晫" });
        continue;
      }

      // 鎻愬彇璇ュ尯鍩熺殑Raw鍍忕礌鏁版嵁锛圧GB锛?      const rawBuffer = await sharp(filePath)
        .extract({ left: rx, top: ry, width: rw, height: rh })
        .raw()
        .toBuffer();

      // 鍒嗘瀽鍍忕礌
      let totalPixels = rawBuffer.length / 3;
      let nonWhitePixels = 0;
      let edgePixels = 0;

      // 杈圭紭妫€娴嬶細瀵规瘮鐩搁偦鍍忕礌鐨勪寒搴﹀樊
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = (y * rw + x) * 3;
          const r = rawBuffer[idx];
          const g = rawBuffer[idx + 1];
          const b = rawBuffer[idx + 2];

          // 妫€鏌ユ槸鍚﹂潪鐧借壊
          const isWhite = r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD;
          if (!isWhite) nonWhitePixels++;

          // 绠€鍗曡竟缂樻娴嬶細姣旇緝涓庡彸渚у儚绱犵殑浜害宸?          if (x < rw - 1) {
            const rn = rawBuffer[idx + 3], gn = rawBuffer[idx + 4], bn = rawBuffer[idx + 5];
            const brightness = (r + g + b) / 3;
            const brightnessNext = (rn + gn + bn) / 3;
            if (Math.abs(brightness - brightnessNext) > 40) edgePixels++;
          }
        }
      }

      const nonWhiteRatio = nonWhitePixels / totalPixels;
      const edgeRatio = edgePixels / totalPixels;

      // 鍒ゆ柇锛氶潪鐧借壊鍍忕礌澶?+ 杈圭紭澶?= 姘村嵃
      const hasContent = nonWhiteRatio > MIN_NONWHITE_RATIO;
      const hasEdges = edgeRatio > MIN_EDGE_RATIO;
      const hasWatermark = hasContent && hasEdges;

      // 缃俊搴﹁绠?      let confidence = 0;
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

    // 缁煎悎鍒ゆ柇锛氫换涓€鍖哄煙鏈夋按鍗?鈫?鏁村紶鍥炬湁姘村嵃
    const anyWatermark = zoneResults.some(z => z.available && z.hasWatermark);
    const avgConfidence = zoneResults
      .filter(z => z.available)
      .reduce((sum, z) => sum + z.confidence, 0) / zoneResults.filter(z => z.available).length;

    return {
      file: basename,
      hasWatermark: anyWatermark,
      confidence: Math.round(avgConfidence * 100) / 100,
      zones: zoneResults,
      dimensions: `${w}x${h}`,
    };

  } catch (err) {
    return { file: basename, hasWatermark: false, confidence: 0, zones: [], error: err.message };
  }
}

// 鈹€鈹€鈹€ 涓诲叆鍙?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
async function main() {
  const args = process.argv.slice(2);
  const specificFile = args.find(a => a.startsWith("--file="))?.split("=")[1];
  const autoRemove = args.includes("--auto-remove");

  const INPUT_DIR = path.join(__dirname, "..", "data", "images", "input");

  let files = [];
  if (specificFile) {
    if (fs.existsSync(specificFile)) files = [specificFile];
    else { console.log(JSON.stringify([{ file: specificFile, error: "File not found" }], null, 2)); return; }
  } else {
    if (!fs.existsSync(INPUT_DIR)) {
      console.log(JSON.stringify([{ error: `Input dir not found: ${INPUT_DIR}` }], null, 2));
      return;
    }
    files = fs.readdirSync(INPUT_DIR)
      .filter(f => [".jpg", ".jpeg", ".png", ".webp", ".tiff"].includes(path.extname(f).toLowerCase()))
      .map(f => path.join(INPUT_DIR, f));
  }

  if (files.length === 0) {
    console.log(JSON.stringify([{ error: "No images found" }], null, 2));
    return;
  }

  // 骞惰妫€娴嬫墍鏈夊浘鐗?  const results = await Promise.all(files.map(f => detectWatermark(f)));

  // 杈撳嚭鎽樿
  const watermarked = results.filter(r => r.hasWatermark);
  const clean = results.filter(r => !r.hasWatermark && !r.error);
  const errors = results.filter(r => r.error);

  console.log("\n=== 姘村嵃妫€娴嬫姤鍛?===");
  console.log(`鎬诲浘鐗? ${results.length}`);
  console.log(`鏈夋按鍗? ${watermarked.length}`);
  console.log(`鏃犳按鍗? ${clean.length}`);
  if (errors.length) console.log(`妫€娴嬪け璐? ${errors.length}`);
  console.log("");

  for (const r of results) {
    const icon = r.hasWatermark ? "馃敶" : "馃煝";
    console.log(`${icon} ${r.file} (${r.dimensions})`);
    if (r.hasWatermark) {
      console.log(`   缃俊搴? ${(r.confidence * 100).toFixed(0)}%`);
      for (const z of r.zones) {
        if (z.available) {
          console.log(`   ${z.name}: ${z.hasWatermark ? "馃敶鏈夋按鍗? : "馃煝骞插噣"} (闈炵櫧姣?{z.nonWhiteRatio}, 杈圭紭姣?{z.edgeRatio}) 鈥?${z.desc}`);
        }
      }
    }
  }

  // 杈撳嚭JSON缁撴灉锛堜緵鍏朵粬鑴氭湰璋冪敤锛?  const jsonPath = path.join(__dirname, "..", "data", "watermark-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n璇︾粏鎶ュ憡宸蹭繚瀛樺埌: ${jsonPath}`);

  // 鑷姩鍘绘按鍗版ā寮?  if (autoRemove) {
    const toRemove = results.filter(r => r.hasWatermark).map(r => r.file);
    if (toRemove.length > 0) {
      console.log(`\n妫€娴嬪埌 ${toRemove.length} 寮犲浘闇€鍘绘按鍗帮紝璋冪敤 process-images.js...`);
      const { execSync } = require("child_process");
      execSync(`node "${path.join(__dirname, "process-images.js")}" --watermark-remove`, {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      });
    } else {
      console.log("\n鎵€鏈夊浘鐗囨棤闇€鍘绘按鍗帮紝璺宠繃澶勭悊銆?);
    }
  }

  // 杩斿洖JSON锛堢敤浜庤鍏朵粬鑴氭湰璋冪敤锛?  console.log("\n=== JSON杈撳嚭 ===");
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });

