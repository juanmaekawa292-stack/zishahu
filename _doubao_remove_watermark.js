const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_SRC = "D:\\图快下载器\\淘宝采集\\0615";
const BASE_OUT = "D:\\图快下载器\\P图成品";

// 需要处理的商品和主图
const products = [
  { dir: "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶", files: ["主图_1.jpg", "主图_4.jpg"] },
  { dir: "00_大容量430ml西施壶描金紫砂壶茶杯一壶二四杯礼盒装企业礼品定制", files: ["主图_1.jpg", "主图_3.jpg", "主图_4.jpg"] },
  { dir: "00_戴晨光宜兴纯手工紫砂壶原矿老紫泥紫砂茶具家用泡茶西施壶220ml", files: ["主图_1.jpg", "主图_3.jpg"] },
  { dir: "00_百年利永 宜兴原矿紫砂壶纯手工泡茶壶功夫茶具套装底槽青仿古壶", files: ["主图_1.jpg", "主图_2.jpg", "主图_3.jpg", "主图_4.jpg"] },
  { dir: "00_颐壶春宜兴紫砂壶纯手工家用泡茶壶全手工功夫茶具原矿紫泥汉瓦壶", files: ["主图_1.jpg"] }
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("=== 开始自动P图 ===");
  console.log("连接Chrome...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];
  
  // 确保当前在豆包主对话区域
  console.log("页面: " + (await page.title()));
  
  let totalDone = 0;
  let totalFailed = 0;
  
  for (const product of products) {
    const outDir = path.join(BASE_OUT, product.dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    for (const fileName of product.files) {
      const imgPath = path.join(BASE_SRC, product.dir, fileName);
      const outPath = path.join(outDir, fileName);
      
      if (!fs.existsSync(imgPath)) {
        console.log("文件不存在:", imgPath);
        continue;
      }
      
      console.log("\n--- [" + product.dir.substring(0, 25) + "...] " + fileName + " ---");
      
      try {
        // 上传文件
        const fileInput = await page.$("input[type=file]");
        if (!fileInput) { console.log("找不到file input"); totalFailed++; continue; }
        
        await fileInput.setInputFiles(imgPath);
        console.log("  已上传: " + fileName);
        
        // 等待上传完成
        await sleep(5000);
        
        // 输入去水印指令到textarea
        const textarea = await page.$("textarea");
        if (!textarea) { console.log("找不到textarea"); totalFailed++; continue; }
        
        await textarea.fill("");
        await textarea.fill("去掉这张商品图底部的水印文字（左下角店铺名、右下角天猫/淘宝Logo），保留图片其他部分不变，保持原图比例和质量");
        console.log("  已输入指令");
        
        // 按回车发送
        await page.keyboard.press("Enter");
        console.log("  已发送，等待AI处理...");
        
        // 等待AI结果 - 最多等120秒
        let found = false;
        for (let t = 0; t < 40; t++) {
          await sleep(3000);
          
          // 检查是否有新生成的图片
          const result = await page.evaluate(() => {
            const imgs = document.querySelectorAll("img");
            for (const img of imgs) {
              const src = img.src || "";
              // 找base64的大图（不是表情、头像之类的小图）
              if (src.indexOf("data:image") === 0 && img.naturalWidth > 400 && img.complete) {
                const size = src.length;
                return { found: true, src: src, w: img.naturalWidth, h: img.naturalHeight, size: size };
              }
            }
            return { found: false };
          });
          
          if (result.found) {
            console.log("  ✅ AI处理完成! (" + result.w + "x" + result.h + ", " + Math.round(result.size/1024) + "KB)");
            
            // 保存图片
            const commaIdx = result.src.indexOf(",");
            const base64Data = result.src.substring(commaIdx + 1);
            const buf = Buffer.from(base64Data, "base64");
            fs.writeFileSync(outPath, buf);
            console.log("  ✅ 已保存到: " + outPath + " (" + buf.length + " bytes)");
            
            found = true;
            totalDone++;
            break;
          }
          
          if (t % 5 === 0) console.log("  ...等待中 (" + ((t+1)*3) + "s)");
        }
        
        if (!found) {
          console.log("  ❌ 超时未获取到结果");
          totalFailed++;
        }
        
        // 处理完一张后等待一下再处理下一张
        await sleep(3000);
        
      } catch (err) {
        console.log("  ❌ 错误: " + err.message);
        totalFailed++;
      }
    }
  }
  
  console.log("\n=== P图完成 ===");
  console.log("成功: " + totalDone + " 张");
  console.log("失败: " + totalFailed + " 张");
  
  await browser.close();
}

main().catch(console.error);
