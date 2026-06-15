/**
 * 智能图片处理脚本 — 自动检测水印，有水印才去
 *
 * 流程：
 * 1. 检测 data/images/input/ 下所有图片的水印情况
 * 2. 有水印的 → 带 --watermark-remove 处理
 * 3. 无水印的 → 正常处理（不去水印）
 *
 * 使用：
 *   node scripts/process-smart.js
 *   node scripts/process-smart.js --input-dir=自定义路径
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { detectWatermark } = require("./detect-watermark.js");

const args = process.argv.slice(2);
const inputDirOverride = args.find(a => a.startsWith("--input-dir="))?.split("=")[1];
const INPUT_DIR = inputDirOverride || path.join(__dirname, "..", "data", "images", "input");
const SCRIPT_DIR = __dirname;

async function main() {
  console.log("=== 智能图片处理管线 ===");
  console.log("");

  // Step 1: 获取所有图片
  if (!fs.existsSync(INPUT_DIR)) {
    console.log("输入目录不存在: " + INPUT_DIR);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(INPUT_DIR)
    .filter(f => [".jpg", ".jpeg", ".png", ".webp", ".tiff"].includes(path.extname(f).toLowerCase()))
    .map(f => path.join(INPUT_DIR, f));

  if (allFiles.length === 0) {
    console.log("没有找到图片文件");
    return;
  }

  console.log("共 " + allFiles.length + " 张图片");
  console.log("");

  // Step 2: 逐张检测水印
  console.log("--- 水印检测 ---");
  const watermarked = [];
  const clean = [];

  for (const f of allFiles) {
    const basename = path.basename(f);
    process.stdout.write("  " + basename + "...");
    const result = await detectWatermark(f);
    if (result.hasWatermark) {
      watermarked.push(f);
      console.log(" 水印 (置信度" + (result.confidence * 100).toFixed(0) + "%)");
    } else {
      clean.push(f);
      console.log(" 干净");
    }
  }

  console.log("");
  console.log("检测完成: " + watermarked.length + "张有水印, " + clean.length + "张无水印");
  console.log("");

  // Step 3: 分批处理
  const scriptPath = path.join(SCRIPT_DIR, "process-images.js");

  // 先处理有水印的（带去水印）
  if (watermarked.length > 0) {
    console.log("--- 处理有水印图片 (带 --watermark-remove) ---");
    // 临时移动有水的图片
    const wmDir = path.join(INPUT_DIR, "..", ".watermark_temp");
    if (!fs.existsSync(wmDir)) fs.mkdirSync(wmDir, { recursive: true });
    // 清空临时目录
    fs.readdirSync(wmDir).forEach(f => fs.unlinkSync(path.join(wmDir, f)));
    // 移动
    for (const f of watermarked) {
      const dest = path.join(wmDir, path.basename(f));
      fs.renameSync(f, dest);
    }
    // 处理
    execSync(
ode "" --input-dir="" --watermark-remove, {
      cwd: path.join(SCRIPT_DIR, ".."),
      stdio: "inherit",
    });
    // 移动回来
    fs.readdirSync(wmDir).forEach(f => {
      const src = path.join(wmDir, f);
      const dest = path.join(INPUT_DIR, f);
      if (fs.existsSync(src)) fs.unlinkSync(dest); // 删掉空壳
      // 其实processed目录已经有了
    });
  }

  // 再处理无水印的（正常处理）
  if (clean.length > 0) {
    console.log("--- 处理无水印图片 (正常处理) ---");
    execSync(
ode "", {
      cwd: path.join(SCRIPT_DIR, ".."),
      stdio: "inherit",
    });
  }

  console.log("");
  console.log("=== 全部完成 ===");
  console.log("水印处理: " + watermarked.length + "张");
  console.log("正常处理: " + clean.length + "张");
  console.log("输出: data/images/processed/");
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
