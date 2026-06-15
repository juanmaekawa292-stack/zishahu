const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const FOLDER = "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
const FILE = "主图_1.jpg";
const srcPath = path.join("D:\\图快下载器\\淘宝采集\\0615", FOLDER, FILE);
const tmpPath = path.join(__dirname, "..", "data", ".tmp", FILE);

// 复制到ASCII路径
if (!fs.existsSync(path.dirname(tmpPath))) fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
fs.copyFileSync(srcPath, tmpPath);
console.log("已复制到临时路径");

async function removeWatermark(filePath) {
  const meta = await sharp(filePath).metadata();
  const w = meta.width, h = meta.height;
  console.log("原图: " + w + "x" + h);

  // 备份原图
  const bakPath = srcPath.replace(/(\.\w+)$/, "_bak$1");
  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(srcPath, bakPath);
    console.log("原图已备份");
  }

  const patchHeight = 70;
  const patchWidth = Math.min(300, w);

  // 左侧：从水印上方取50px拉伸到70px
  const leftSrc = await sharp(filePath)
    .extract({ left: 0, top: h - patchHeight - 50, width: patchWidth, height: 50 })
    .resize(patchWidth, patchHeight)
    .blur(3)
    .toBuffer();

  // 右侧
  const rightSrc = await sharp(filePath)
    .extract({ left: w - patchWidth, top: h - patchHeight - 50, width: patchWidth, height: 50 })
    .resize(patchWidth, patchHeight)
    .blur(3)
    .toBuffer();

  // 合成
  const result = await sharp(filePath)
    .composite([
      { input: leftSrc, top: h - patchHeight, left: 0 },
      { input: rightSrc, top: h - patchHeight, left: w - patchWidth }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  fs.writeFileSync(filePath, result);
  console.log("✅ 处理完成! 结果: " + result.length + " bytes");
}

removeWatermark(tmpPath).then(async () => {
  // 复制回原位置
  fs.copyFileSync(tmpPath, srcPath);
  console.log("✅ 已覆盖原图");
  fs.unlinkSync(tmpPath);
  const tmpDir = path.dirname(tmpPath);
  if (fs.existsSync(tmpDir) && fs.readdirSync(tmpDir).length === 0) fs.rmdirSync(tmpDir);
}).catch(console.error);
