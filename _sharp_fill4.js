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

  const zoneH = 70;    // 水印区域高度
  const zoneW = 300;   // 水印区域宽度
  const stripH = 8;    // 从上方取8px高的色条

  // 左侧：从水印上方取8px高的条，拉伸到70px覆盖水印区
  const leftPatch = await sharp(tmpSrc)
    .extract({ left: 0, top: h - zoneH - stripH, width: zoneW, height: stripH })
    .resize(zoneW, zoneH, { fit: "fill" })
    .toBuffer();

  // 右侧同理
  const rightPatch = await sharp(tmpSrc)
    .extract({ left: w - zoneW, top: h - zoneH - stripH, width: zoneW, height: stripH })
    .resize(zoneW, zoneH, { fit: "fill" })
    .toBuffer();

  // 合成
  await sharp(tmpSrc)
    .composite([
      { input: leftPatch, top: h - zoneH, left: 0 },
      { input: rightPatch, top: h - zoneH, left: w - zoneW }
    ])
    .jpeg({ quality: 95 })
    .toFile(tmpOut);

  fs.copyFileSync(tmpOut, srcPath);
  console.log("✅ 处理完成! 从上方取色拉伸覆盖水印区");

  // 清理
  [tmpSrc, tmpOut].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  const d = path.dirname(tmpSrc);
  if (fs.existsSync(d) && fs.readdirSync(d).length === 0) fs.rmdirSync(d);
}

run().catch(console.error);
