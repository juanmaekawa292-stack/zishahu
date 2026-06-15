const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// 先处理古悦堂的主图_1
const FOLDER = "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
const FILE = "主图_1.jpg";
const imgPath = path.join("D:\\图快下载器\\淘宝采集\\0615", FOLDER, FILE);

async function removeWatermark(imgPath) {
  const meta = await sharp(imgPath).metadata();
  const w = meta.width, h = meta.height;
  console.log("原图: " + w + "x" + h);

  // 水印区域（从detect-watermark.js来的配置）
  const WATERMARK_ZONES = [
    { name: "bottom-left",  x: 0,   y: h - 70, w: Math.min(300, w), h: 70 },
    { name: "bottom-right", x: w - Math.min(300, w), y: h - 70, w: Math.min(300, w), h: 70 },
  ];

  // 先模糊整张图做个"背景模糊图"
  const bgBlurred = await sharp(imgPath).blur(30).toBuffer();

  // 在原图上把水印区域替换为模糊版本
  let pipeline = sharp(imgPath);

  for (const zone of WATERMARK_ZONES) {
    // 从模糊图上裁剪出对应区域
    const blurredPatch = await sharp(bgBlurred)
      .extract({ left: zone.x, top: zone.y, width: zone.w, height: zone.h })
      .toBuffer();

    // 叠加到原图上
    const composite = await sharp(imgPath)
      .composite([{ input: blurredPatch, top: zone.y, left: zone.x }])
      .toBuffer();

    // 用处理后的图继续处理下一个区域
    fs.writeFileSync(imgPath.replace(".jpg", "_tmp.jpg"), composite);
    pipeline = sharp(imgPath.replace(".jpg", "_tmp.jpg"));
  }

  // 最终输出
  const result = await sharp(imgPath.replace(".jpg", "_tmp.jpg"))
    .jpeg({ quality: 95 })
    .toBuffer();

  // 备份原图
  const bakPath = imgPath.replace(/(\.\w+)$/, "_bak$1");
  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(imgPath, bakPath);
    console.log("原图已备份");
  }

  // 覆盖原图
  fs.writeFileSync(imgPath, result);
  console.log("✅ 水印区域已模糊处理");
  console.log("水印位置: 底部左右角 (" + WATERMARK_ZONES[0].w + "x" + WATERMARK_ZONES[0].h + " 每块)");

  // 清理临时文件
  const tmpFile = imgPath.replace(".jpg", "_tmp.jpg");
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}

removeWatermark(imgPath).catch(console.error);
