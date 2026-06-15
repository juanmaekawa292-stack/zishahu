const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const BASE_DIR = "D:\\图快下载器\\淘宝采集\\0615";
const API_URL = "https://api.xiaolashou.com/v1/chat/completions";
const API_KEY = "sk-msebnXm1hoQH77VKXGPL4ZRTGhJO9LyPd7KndCtdNk99AVSX";
const MODEL = "gemini-2.5-flash-lite";
const TMP_DIR = path.join(__dirname, "..", "data", ".tmp_detect");

/**
 * 压缩图片到10KB以内（不覆盖原图）
 */
async function compressImage(inputPath, maxBytes = 10 * 1024) {
  const basename = path.basename(inputPath);
  const outPath = path.join(TMP_DIR, basename);
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const meta = await sharp(inputPath).metadata();
  let quality = 60;
  let targetWidth = 600;

  for (let attempt = 0; attempt < 15; attempt++) {
    let pipeline = sharp(inputPath);
    if (meta.width > targetWidth) {
      pipeline = pipeline.resize(targetWidth);
    }
    await pipeline.jpeg({ quality }).toFile(outPath);
    const size = fs.statSync(outPath).size;
    if (size <= maxBytes) {
      console.log("  压缩: " + (size / 1024).toFixed(1) + "KB (质量=" + quality + ", 宽=" + targetWidth + ")");
      return outPath;
    }
    if (quality > 15) { quality -= 5; }
    else if (targetWidth > 200) { targetWidth = Math.round(targetWidth * 0.7); quality = 40; }
    else { break; }
  }
  const size = fs.statSync(outPath).size;
  console.log("  压缩: " + (size / 1024).toFixed(1) + "KB (略超10KB但可接受)");
  return outPath;
}

/**
 * 调用AI检测
 */
async function detectWithAI(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const body = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `你是电商图片质检专家。检查这张商品图，判断是否需要P图去水印。

判断标准：
- 需要P图：图片底部或角落有店铺名/品牌Logo（如"古悦堂"、"颐壶春"等）、平台Logo（天猫/淘宝）、促销文字（618、满减、折扣等）、或任何其他水印文字
- 不需要P图：图片干净无任何水印、Logo、促销文字

请只回答一个字：'是'（需要P图）或'否'（不需要）`
          },
          {
            type: "image_url",
            image_url: {
              url: "data:image/jpeg;base64," + base64Image
            }
          }
        ]
      }
    ],
    max_tokens: 10
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("API错误: " + response.status + " " + errText);
  }

  const data = await response.json();
  const result = data.choices[0].message.content.trim();
  return result;
}

function cleanup() {
  if (fs.existsSync(TMP_DIR)) {
    const files = fs.readdirSync(TMP_DIR);
    for (const f of files) fs.unlinkSync(path.join(TMP_DIR, f));
    fs.rmdirSync(TMP_DIR);
  }
}

async function main() {
  console.log("=== AI水印检测 (gemini-2.5-flash-lite) ===");
  console.log("");

  const folders = fs.readdirSync(BASE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name).sort();

  const allResults = [];

  for (const folder of folders) {
    const folderPath = path.join(BASE_DIR, folder);
    const mainImages = fs.readdirSync(folderPath)
      .filter(f => /^主图.*\.(jpg|png|webp)$/i.test(f)).sort();

    if (mainImages.length === 0) continue;

    console.log("[" + folder.substring(0, 30) + "...] " + mainImages.length + "张主图");
    const folderResults = [];

    for (const imgFile of mainImages) {
      const imgPath = path.join(folderPath, imgFile);
      process.stdout.write("  " + imgFile + "... ");

      try {
        const compressedPath = await compressImage(imgPath);
        const aiResult = await detectWithAI(compressedPath);
        const needsP图 = aiResult === "是" || aiResult.includes("是");

        console.log("  => " + (needsP图 ? "⚠️ 需要P图" : "✅ 不需要"));

        folderResults.push({ file: imgFile, needsP图, aiResult });

        if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
        await new Promise(r => setTimeout(r, 800));

      } catch (err) {
        console.log("  ❌ " + err.message);
        folderResults.push({ file: imgFile, needsP图: false, aiResult: "error" });
      }
    }

    allResults.push({ folder, results: folderResults });
    console.log("");
  }

  // 输出报告
  console.log("\n" + "=".repeat(60));
  console.log("                 水印检测报告");
  console.log("=".repeat(60));

  let totalNeed = 0, totalClean = 0;
  for (const item of allResults) {
    const need = item.results.filter(r => r.needsP图);
    const clean = item.results.filter(r => !r.needsP图);
    totalNeed += need.length; totalClean += clean.length;

    console.log("\n[" + item.folder.substring(0, 28) + "...]");
    for (const r of item.results) {
      console.log("  " + (r.needsP图 ? "⚠️" : "✅") + " " + r.file);
    }
    if (need.length > 0) {
      console.log("  需P图: " + need.map(r => r.file).join(", "));
    }
  }

  console.log("\n" + "-".repeat(40));
  console.log("总计: " + totalNeed + "张需P图, " + totalClean + "张干净");
  console.log("-".repeat(40));

  cleanup();
}

main().catch(err => { console.error("致命错误:", err.message); cleanup(); });
