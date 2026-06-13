/**
 * 视频处理 - Video Processing Pipeline
 *
 * 采集视频压缩/去水印并生成缩略图
 * 需要FFmpeg，请确保已添加到 PATH
 *
 * 用法
 *   node scripts/process-videos.js                    # 处理 data/videos/input/ 所有视频
 *   node scripts/process-videos.js --file xxx.mp4     # 处理单个文件
 *   node scripts/process-videos.js --preview          # 预览模式
 *
 * 输出规格
 *   格式: H.264 MP4
 *   分辨率: 720p max (1280×720)
 *   帧率: 30fps
 *   音频: AAC, 128kbps
 *   缩略图: 第一帧 JPEG
 *
 * 前提
 *   需要安装 FFmpeg，Windows 用户请访问 https://ffmpeg.org/download.html 下载
 *   安装后确保将 ffmpeg 添加到 PATH 环境变量
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });

const fs = require("fs");
const path = require("path");
const { execSync, exec } = require("child_process");

// 视频输入/输出/缩略图目录
const INPUT_DIR = path.join(__dirname, "..", "data", "videos", "input");
const OUTPUT_DIR = path.join(__dirname, "..", "data", "videos", "processed");
const THUMB_DIR = path.join(__dirname, "..", "data", "videos", "thumbs");

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const MAX_FPS = 30;
const AUDIO_BITRATE = "128k";
const VIDEO_CRF = 23; // 18-28: 质量范围，23为平衡值

const args = process.argv.slice(2);
const preview = args.includes("--preview");
const specificFile = args.find(a => a.startsWith("--file="))?.split("=")[1];

// 格式化文件大小显示
function formatSize(bytes) {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + "GB";
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + String(s).padStart(2, "0");
}

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv"];

function isVideoFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

function getVideoInfo(filePath) {
  try {
    const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    const result = execSync(cmd, { encoding: "utf-8", timeout: 15000 });
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
}

// 处理单个视频文件，转码并生成缩略图
async function processVideo(filePath) {
  const basename = path.basename(filePath);
  const nameNoExt = path.basename(filePath, path.extname(filePath));

  if (!isVideoFile(filePath)) {
    console.log("  × 不支持格式: " + basename);
    return null;
  }

  const info = getVideoInfo(filePath);
  if (!info || !info.format) {
    console.log("  × 无法读取视频信息: " + basename);
    return null;
  }

  const duration = parseFloat(info.format.duration || "0");
  const size = parseInt(info.format.size || "0");
  const bitrate = info.format.bit_rate || "?";

  console.log("  处理 " + basename);
  console.log("     时长: " + formatDuration(duration) + " | 大小: " + formatSize(size) + " | 码率: " + bitrate + "bps");

  if (preview) return null;

  // Output paths
  const outputName = nameNoExt + ".mp4";
  const outputPath = path.join(OUTPUT_DIR, outputName);
  const thumbPath = path.join(THUMB_DIR, nameNoExt + ".jpg");

  // Build ffmpeg command
  const scaleFilter = "scale='" + TARGET_WIDTH + ":" + TARGET_HEIGHT + "':force_original_aspect_ratio=decrease,pad=" + TARGET_WIDTH + ":" + TARGET_HEIGHT + ":(ow-iw)/2:(oh-ih)/2:black";
  const cmd = [
    "ffmpeg",
    "-i", '"' + filePath + '"',
    "-vf", '"' + scaleFilter + '"',
    "-r", String(MAX_FPS),
    "-c:v", "libx264",
    "-crf", String(VIDEO_CRF),
    "-preset", "medium",
    "-c:a", "aac",
    "-b:a", AUDIO_BITRATE,
    "-movflags", "+faststart",
    "-y",
    '"' + outputPath + '"',
  ].join(" ");

  console.log("     转码中...");
  try {
    execSync(cmd, { encoding: "utf-8", timeout: 300000 });
    const outSize = fs.statSync(outputPath).size;
    console.log("     v 输出: " + outputName + " (" + formatSize(outSize) + ")");
  } catch (e) {
    console.log("     x 转码失败: " + (e.message || e));
    return null;
  }

  // Generate thumbnail (first frame)
  const thumbCmd = [
    "ffmpeg",
    "-i", '"' + filePath + '"',
    "-vframes", "1",
    "-vf", '"' + scaleFilter + '"',
    "-y",
    '"' + thumbPath + '"',
  ].join(" ");

  try {
    execSync(thumbCmd, { encoding: "utf-8", timeout: 30000 });
    const thumbSize = fs.statSync(thumbPath).size;
    console.log("     生成缩略图: " + path.basename(thumbPath) + " (" + formatSize(thumbSize) + ")");
  } catch (e) {
    console.log("     x 缩略图生成失败: " + (e.message || e));
  }

  return outputPath;
}

// 主流程：检查FFmpeg、扫描目录、依次处理所有视频文件
async function main() {
  // Check ffmpeg availability
  try {
    execSync("ffmpeg -version", { encoding: "utf-8", timeout: 5000 });
  } catch {
    console.log("✗ FFmpeg 未安装或不在 PATH 中\n");
");
    console.log("请访问 https://ffmpeg.org/download.html 下载 FFmpeg");
    console.log("   安装后运行 'ffmpeg -version' 验证是否就绪\n");
");
    console.log("设置输出目录");
    console.log("   处理后的视频将用于 Shopify 商品展示");
    console.log("   缩略图会自动生成并匹配对应商品");
    return;
  }

  [INPUT_DIR, OUTPUT_DIR, THUMB_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  let files = [];
  if (specificFile) {
    if (fs.existsSync(specificFile)) files = [specificFile];
    else { console.log("未找到文件: " + specificFile);
 console.log("检查目录: " + INPUT_DIR); return; }
  } else {
    files = fs.readdirSync(INPUT_DIR)
      .filter(f => isVideoFile(f))
      .map(f => path.join(INPUT_DIR, f));
  }

  if (files.length === 0) {
    console.log("暂无可处理的视频文件");
    console.log("   请将视频放入: " + INPUT_DIR);
    console.log("   支持的格式: " + VIDEO_EXTENSIONS.join(", "));
    return;
  }

  console.log("开始处理 " + files.length + " 个视频文件...\n");
");

  let success = 0;
  for (const f of files) {
    const result = await processVideo(f);
    if (result) success++;
    console.log("");
  }

  console.log("v 完成! " + success + "/" + files.length + " 个视频处理成功");
  console.log("   输出: " + OUTPUT_DIR);
  if (success > 0) console.log("   缩略图: " + THUMB_DIR);
}

main().catch(e => { console.error("错误:", e.message); process.exit(1); });