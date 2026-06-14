const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INPUT_DIR = path.join(__dirname, "..", "data", "images", "input");
const OUTPUT_DIR = path.join(__dirname, "..", "data", "images", "processed");
const BACKUP_DIR = path.join(__dirname, "..", "data", "images", "backup");
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1200;
const FORMAT = "webp";
const QUALITY = 85;
const BG_COLOR = { r: 255, g: 255, b: 255, alpha: 1 };

const args = process.argv.slice(2);
const specificFile = args.find(a => a.startsWith("--file="))?.split("=")[1];
const inputDirOverride = args.find(a => a.startsWith("--input-dir="))?.split("=")[1];
const enableWatermarkRemoval = args.includes("--watermark-remove");
function formatSize(bytes) {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + "KB";
  return (bytes/(1024*1024)).toFixed(1) + "MB";
}
async function processImage(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext)) {
    console.log('  Skipped (unsupported): ' + basename);
    return null;
  }

  const outputName = basename.replace(ext, '.webp');
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    let image = sharp(filePath);
    let metadata = await image.metadata();

    // 1. Backup original
    const backupPath = path.join(BACKUP_DIR, basename);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    // 2. Watermark removal: cover bottom-left (古悦堂 brand) + bottom-right (天猫 logo)
    if (enableWatermarkRemoval) {
      const w = metadata.width || TARGET_WIDTH;
      const h = metadata.height || TARGET_HEIGHT;
      // Create white overlays covering both watermark areas (fully opaque, generous coverage)
      const overlaySvg = '<svg width="' + w + '" height="' + h + '">' +
        '<rect x="0" y="' + (h - 70) + '" width="300" height="70" fill="white" opacity="1"/>' +  // bottom-left: 古悦堂 brand
        '<rect x="' + (w - 300) + '" y="' + (h - 70) + '" width="300" height="70" fill="white" opacity="1"/>' +  // bottom-right: 天猫 logo
        '</svg>';
      image = image.composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }]);
    }

    // 3. Crop to square + resize
    image = image.resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: 'cover',
      position: 'center',
      background: BG_COLOR,
    });

    // 4. White background enhancement
    image = image.toColorspace('srgb');

    // 5. Output as WebP
    await image
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(outputPath);

    const outSize = fs.statSync(outputPath).size;
    const inSize = fs.statSync(filePath).size;
    console.log('  -> ' + outputName + ' (' + formatSize(outSize) + ', ' + Math.round(outSize/inSize*100) + '% of original)');
    return outputPath;

  } catch (err) {
    console.log('  Error: ' + basename + ' - ' + err.message);
    return null;
  }
}
async function main() {
  const inputDir = inputDirOverride || INPUT_DIR;
  const dirs = [inputDir, OUTPUT_DIR, BACKUP_DIR];
  dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  let files = [];
  if (specificFile) {
    if (fs.existsSync(specificFile)) { files = [specificFile]; }
    else { console.log('File not found: ' + specificFile); return; }
  } else {
    files = fs.readdirSync(inputDir)
      .filter(f => ['.jpg','.jpeg','.png','.webp','.tiff'].includes(path.extname(f).toLowerCase()))
      .map(f => path.join(inputDir, f));
  }

  if (files.length === 0) {
    console.log('No images found in: ' + inputDir);
    console.log('Place product images in data/images/input/ and re-run.');
    return;
  }

  console.log('Processing ' + files.length + ' images...');
  console.log('  Input: ' + inputDir);
  console.log('  Output: ' + OUTPUT_DIR);
  console.log('  Size: ' + TARGET_WIDTH + 'x' + TARGET_HEIGHT + ' (' + FORMAT + ', Q' + QUALITY + ')');
  if (enableWatermarkRemoval) console.log('  Watermark removal: ON');
  console.log('');

  let success = 0;
  for (const f of files) {
    process.stdout.write('  ' + path.basename(f) + '...');
    const result = await processImage(f);
    if (result) success++;
  }

  console.log('');
  console.log('Done! ' + success + '/' + files.length + ' images processed.');
  console.log('Output: ' + OUTPUT_DIR);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
