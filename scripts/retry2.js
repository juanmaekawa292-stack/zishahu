const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = "data/images/input";
const OUTPUT_DIR = "data/images/processed";
const failed = ["bnly_主图_1.jpg","bnly_主图_2.jpg","bnly_主图_3.jpg","bnly_主图_4.jpg","bnly_主图_5.jpg","fanggu_主图_1.jpg","fanggu_主图_2.jpg","fanggu_主图_3.jpg","fanggu_主图_4.jpg"];

async function go() {
  for (const f of failed) {
    const fp = path.join(INPUT_DIR, f);
    if (!fs.existsSync(fp)) { console.log("Skip: " + f); continue; }
    try {
      const meta = await sharp(fp).metadata();
      const w = meta.width, h = meta.height;
      const svg = Buffer.from('<svg width="' + w + '" height="' + h + '"><rect x="0" y="' + (h-70) + '" width="300" height="70" fill="white"/><rect x="' + (w-300) + '" y="' + (h-70) + '" width="300" height="70" fill="white"/></svg>');
      const overlay = await sharp(svg).png().toBuffer();
      const outName = f.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      await sharp(fp)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .resize(1200, 1200, { fit: "cover", background: { r:255,g:255,b:255,alpha:1 } })
        .webp({ quality: 85 })
        .toFile(path.join(OUTPUT_DIR, outName));
      const size = fs.statSync(path.join(OUTPUT_DIR, outName)).size;
      console.log("OK: " + outName + " (" + (size/1024).toFixed(1) + "KB)");
    } catch(e) {
      console.log("FAIL: " + f + " - " + e.message);
    }
  }
  console.log("Done.");
}
go().catch(e => console.error(e));
