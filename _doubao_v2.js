const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const FOLDER = "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
const FILE = "主图_1.jpg";
const imgPath = path.join("D:\\图快下载器\\淘宝采集\\0615", FOLDER, FILE);
const bakPath = imgPath.replace(/(\.\w+)$/, "_bak$1");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("连接Chrome...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];
  
  console.log("页面: " + (await page.title()));

  // 看看当前对话区域是否有之前的图片需要清理 - 先点"新对话"
  // 找新对话按钮
  const newChatBtn = await page.$("a[href*='new'], a:has-text('新对话'), button:has-text('新对话')");
  if (newChatBtn) {
    console.log("开新对话...");
    await newChatBtn.click();
    await sleep(3000);
  }

  // 1. 上传图片
  const fileInput = await page.$("input[type=file]");
  if (!fileInput) { console.log("找不到file input"); return; }
  
  await fileInput.setInputFiles(imgPath);
  console.log("✅ 图片已上传");
  await sleep(5000);

  // 2. 找textarea并输入指令
  const textarea = await page.$("textarea");
  if (!textarea) { console.log("找不到textarea"); return; }
  
  await textarea.click();
  await textarea.fill("");
  await page.keyboard.type("帮我去除有关天猫淘宝拼多多 的水印图标，还有活动的水印", { delay: 50 });
  console.log("✅ 指令已输入");
  
  await sleep(1000);
  
  // 3. 发送
  await page.keyboard.press("Enter");
  console.log("已发送，等待AI处理...");
  
  // 4. 等待AI结果
  for (let t = 0; t < 60; t++) {
    await sleep(5000);
    
    const result = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      let candidates = [];
      for (const img of imgs) {
        const src = img.src || "";
        if (src.indexOf("data:image") === 0 && img.naturalWidth > 300 && img.naturalHeight > 300 && img.complete) {
          candidates.push({
            w: img.naturalWidth,
            h: img.naturalHeight,
            size: src.length,
            dataUrl: src
          });
        }
      }
      // 选最大的那张图
      candidates.sort((a, b) => b.size - a.size);
      return candidates.length > 0 ? candidates[0] : null;
    });
    
    if (result && result.size > 10000) {
      console.log("✅ AI处理完成! " + result.w + "x" + result.h + ", " + Math.round(result.size/1024) + "KB");
      
      // 提取base64数据
      const dataUrl = result.dataUrl;
      const commaIdx = dataUrl.indexOf(",");
      const base64Data = dataUrl.substring(commaIdx + 1).trim();
      const buf = Buffer.from(base64Data, "base64");
      
      console.log("原始dataUrl前50字符: " + dataUrl.substring(0, 50));
      console.log("原始dataUrl长度: " + dataUrl.length);
      console.log("解码后大小: " + buf.length + " bytes");
      
      // 备份原图
      if (!fs.existsSync(bakPath)) {
        fs.copyFileSync(imgPath, bakPath);
        console.log("✅ 原图已备份: " + path.basename(bakPath));
      }
      
      if (buf.length > 1000) {
        fs.writeFileSync(imgPath, buf);
        console.log("✅ 已覆盖原图!");
      } else {
        console.log("❌ 数据太短，可能不是正确的结果，跳过保存");
      }
      
      await browser.close();
      return;
    }
    
    if (t % 4 === 0) {
      if (result) console.log("  当前数据大小: " + Math.round(result.size/1024) + "KB，继续等待更大结果...  (" + ((t+1)*5) + "s)");
      else console.log("  等待中... (" + ((t+1)*5) + "s)");
    }
  }
  
  console.log("❌ 超时");
  await browser.close();
}

main().catch(err => { console.error("错误:", err.message); process.exit(1); });
