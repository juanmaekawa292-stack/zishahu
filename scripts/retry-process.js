const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = 'data/images/input';
const OUTPUT_DIR = 'data/images/processed';

async function processImage(filePath) {
  const basename = path.basename(filePath);
  const outputName = basename.replace(path.extname(basename), '.webp');
  const outputPath = path.join(OUTPUT_DIR, outputName);
  try {
    let image = sharp(filePath);
    const meta = await image.metadata();
    const w = meta.width, h = meta.height;
    const overlaySvg = '<svg width="' + w + '" height="' + h + '">' +
      '<rect x="0" y="' + (h - 70) + '" width="300" height="70" fill="white" opacity="1"/>' +
      '<rect x="' + (w - 300) + '" y="' + (h - 70) + '" width="300" height="70" fill="white" opacity="1"/>' +
      '</svg>';
    image = image.composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }]);
    image = image.resize({ width: 1200, height: 1200, fit: 'cover', position: 'center', background: { r:255,g:255,b:255,alpha:1 } });
    await image.webp({ quality: 85, effort: 4 }).toFile(outputPath);
    const size = fs.statSync(outputPath).size;
    console.log('  OK: ' + outputName + ' (' + (size/1024).toFixed(1) + 'KB)');
  } catch(e) {
    console.log('  FAIL: ' + basename + ' - ' + e.message);
  }
}

async function main() {
  const retry = ['bnly_主图_1.jpg','bnly_主图_2.jpg','bnly_主图_3.jpg','bnly_主图_4.jpg','bnly_主图_5.jpg','fanggu_主图_1.jpg','fanggu_主图_2.jpg','fanggu_主图_3.jpg','fanggu_主图_4.jpg'];
  for (const f of retry) {
    const fp = path.join(INPUT_DIR, f);
    if (fs.existsSync(fp)) { console.log('Retry: ' + f); await processImage(fp); }
    else { console.log('Skip (not found): ' + f); }
  }
  console.log('Done.');
}
main().catch(e => console.error(e));
