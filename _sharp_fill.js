const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const FOLDER = "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
const FILE = "主图_1.jpg";
const imgPath = path.join("D:\\图快下载器\\淘宝采集\\0615", FOLDER, FILE);

async function removeWatermark(imgPath) {
  const meta = await sharp(imgPath).metadata();
  const w = meta.width, h = meta.height;
  console.log("原图: " + w + "x" + h);

  // 备份
  const bakPath = imgPath.replace(/(\.\w+)$/, "_bak$1");
  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(imgPath, bakPath);
    console.log("原图已备份");
  }

  // 水印通常在底部70px区域，左右角各300px
  // 策略：从水印区域上方取一小条，拉伸覆盖水印区域
  const patchHeight = 70;
  const patchWidth = 300;
  
  // 左侧水印 - 从上方取50px高的条，拉伸到70px
  const leftSrc = await sharp(imgPath)
    .extract({ left: 0, top: h - patchHeight - 50, width: patchWidth, height: 50 })
    .resize(patchWidth, patchHeight)
    .blur(3)  // 轻微模糊让过渡自然
    .toBuffer();

  // 右侧水印 - 同理
  const rightSrc = await sharp(imgPath)
    .extract({ left: w - patchWidth, top: h - patchHeight - 50, width: patchWidth, height: 50 })
    .resize(patchWidth, patchHeight)
    .blur(3)
    .toBuffer();

  // 合成到原图
  const result = await sharp(imgPath)
    .composite([
      { input: leftSrc, top: h - patchHeight, left: 0 },
      { input: rightSrc, top: h - patchHeight, left: w - patchWidth }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  fs.writeFileSync(imgPath, result);
  console.log("✅ 水印区域已处理 (从上方取色填充)");
  console.log("处理区域: 底部左右角 " + patchWidth + "x" + patchHeight);
}

removeWatermark(imgPath).catch(console.error);
