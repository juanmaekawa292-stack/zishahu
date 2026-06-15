const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const FOLDER = "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
const FILE = "主图_1.jpg";
const srcPath = path.join("D:\\图快下载器\\淘宝采集\\0615", FOLDER, FILE);
const tmpDir = path.join(__dirname, "..", "data", ".tmp");
const tmpSrc = path.join(tmpDir, "input_" + FILE);
const tmpOut = path.join(tmpDir, "output_" + FILE);

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
fs.copyFileSync(srcPath, tmpSrc);
console.log("复制到临时路径");

async function run() {
  const meta = await sharp(tmpSrc).metadata();
  const w = meta.width, h = meta.height;
  console.log("原图: " + w + "x" + h);

  // 备份
  const bakPath = srcPath.replace(/(\.\w+)$/, "_bak$1");
  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(srcPath, bakPath);
    console.log("原图已备份");
  }

  const ph = 70;
  const pw = Math.min(300, w);

  // 左侧：从水印上方取色拉伸覆盖
  const leftPatch = await sharp(tmpSrc)
    .extract({ left: 0, top: h - ph - 50, width: pw, height: 50 })
    .resize(pw, ph)
    .blur(3)
    .toBuffer();

  // 右侧
  const rightPatch = await sharp(tmpSrc)
    .extract({ left: w - pw, top: h - ph - 50, width: pw, height: 50 })
    .resize(pw, ph)
    .blur(3)
    .toBuffer();

  // 合成到输出文件
  await sharp(tmpSrc)
    .composite([
      { input: leftPatch, top: h - ph, left: 0 },
      { input: rightPatch, top: h - ph, left: w - pw }
    ])
    .jpeg({ quality: 95 })
    .toFile(tmpOut);

  // 复制回原位置
  fs.copyFileSync(tmpOut, srcPath);
  const resultSize = fs.statSync(tmpOut).size;
  console.log("✅ 处理完成! " + resultSize + " bytes");

  // 清理
  [tmpSrc, tmpOut].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  if (fs.existsSync(tmpDir) && fs.readdirSync(tmpDir).length === 0) fs.rmdirSync(tmpDir);
}

run().catch(console.error);
