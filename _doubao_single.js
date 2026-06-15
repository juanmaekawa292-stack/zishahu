const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const imgPath = "D:\\图快下载器\\淘宝采集\\0615\\00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶\\主图_1.jpg";

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("连接Chrome...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];
  
  console.log("当前页面: " + (await page.title()));
  
  // 1. 上传图片
  const fileInput = await page.$("input[type=file]");
  if (!fileInput) { console.log("找不到file input"); return; }
  
  await fileInput.setInputFiles(imgPath);
  console.log("✅ 图片已上传");
  
  // 等上传完成
  await sleep(5000);
  
  // 2. 输入指令
  const textarea = await page.$("textarea");
  if (!textarea) { console.log("找不到textarea"); return; }
  
  await textarea.fill("");
  await sleep(1000);
  await textarea.fill("帮我去除有关天猫淘宝拼多多 的水印图标，还有活动的水印");
  console.log("✅ 已输入指令");
  
  // 3. 按回车发送
  await page.keyboard.press("Enter");
  console.log("等待AI处理...");
  
  // 4. 等待结果，最多等180秒
  for (let t = 0; t < 60; t++) {
    await sleep(3000);
    
    const result = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      let best = null;
      for (const img of imgs) {
        const src = img.src || "";
        if (src.indexOf("data:image") === 0 && img.naturalWidth > 400 && img.complete) {
          const size = src.length;
          if (!best || size > best.size) {
            best = { src, w: img.naturalWidth, h: img.naturalHeight, size };
          }
        }
      }
      return best;
    });
    
    if (result) {
      console.log("✅ AI处理完成! " + result.w + "x" + result.h + ", " + Math.round(result.size/1024) + "KB");
      
      // 保存并覆盖原图
      const commaIdx = result.src.indexOf(",");
      const base64Data = result.src.substring(commaIdx + 1);
      const buf = Buffer.from(base64Data, "base64");
      
      // 先备份原图
      const bakPath = imgPath.replace(/(\.\w+)$/, "_bak$1");
      if (!fs.existsSync(bakPath)) {
        fs.copyFileSync(imgPath, bakPath);
        console.log("✅ 原图已备份: " + path.basename(bakPath));
      }
      
      fs.writeFileSync(imgPath, buf);
      console.log("✅ 已覆盖原图! (" + buf.length + " bytes)");
      await browser.close();
      return;
    }
    
    if (t % 5 === 0) console.log("  等待中... " + ((t+1)*3) + "s");
  }
  
  console.log("❌ 超时未获取到结果");
  await browser.close();
}

main().catch(err => { console.error("错误:", err.message); process.exit(1); });
