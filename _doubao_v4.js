const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const FOLDER = "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
const FILE = "主图_1.jpg";
const imgPath = path.join("D:\\图快下载器\\淘宝采集\\0615", FOLDER, FILE);
const bakPath = imgPath.replace(/(\.\w+)$/, "_bak$1");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  console.log("页面: " + (await page.title()));

  // 开一个新对话
  console.log("开新对话...");
  await page.goto("https://www.doubao.com/chat/", { waitUntil: "networkidle" });
  await sleep(3000);

  // 上传图片
  const fileInput = await page.$("input[type=file]");
  if (!fileInput) { console.log("找不到file input"); return; }
  await fileInput.setInputFiles(imgPath);
  console.log("✅ 上传完成");
  await sleep(5000);

  // 输入指令
  const textarea = await page.$("textarea");
  if (!textarea) { console.log("找不到textarea"); return; }
  await textarea.click();
  await textarea.fill("");
  await page.keyboard.type("帮我去除有关天猫淘宝拼多多 的水印图标，还有活动的水印", { delay: 30 });
  console.log("✅ 指令已输入");
  await sleep(1000);

  // 发送
  await page.keyboard.press("Enter");
  console.log("\n已发送，等待AI处理...\n");

  // 等待AI结果 - 检测页面变化
  let lastImgCount = 0;
  for (let t = 0; t < 80; t++) {
    await sleep(5000);

    const state = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return {
        count: imgs.length,
        imgs: Array.from(imgs).map(i => ({
          srcStart: (i.src || "").substring(0, 15),
          srcLen: (i.src || "").length,
          w: i.naturalWidth,
          h: i.naturalHeight
        })),
        text: document.body.innerText.split("\n").filter(l => l.trim()).slice(-5)
      };
    });

    // 找有没有新的有效图片
    const newImages = state.imgs.filter(i => {
      if (i.w > 400 && i.h > 400) {
        if (i.srcStart === "data:image" && i.srcLen > 50000) return true;
        if (i.srcStart === "blob:https://") return true;
        if (i.srcStart === "https://" && i.srcLen > 100) return true;
      }
      return false;
    });

    // 页面文本变化
    const hasResult = state.text.some(l => l.includes("已为您") || l.includes("完成") || l.includes("好了"));

    if (state.imgs.length > lastImgCount) {
      console.log("  新图片出现! 总数: " + state.imgs.length);
      lastImgCount = state.imgs.length;
    }

    if (newImages.length > 0) {
      console.log("✅ 发现可能的结果图片: " + newImages.length + "张");
      for (const img of newImages) {
        console.log("  " + img.w + "x" + img.h + " " + img.srcStart + "... (" + img.srcLen + " chars)");
      }

      // 尝试下载第一张候选图
      for (const candidate of newImages) {
        if (candidate.srcStart === "data:image" && candidate.srcLen > 50000) {
          const imgData = await page.evaluate(() => {
            const imgs = document.querySelectorAll("img");
            for (const img of imgs) {
              const src = img.src || "";
              if (src.indexOf("data:image") === 0 && src.length > 50000) return src;
            }
            return null;
          });
          if (imgData) {
            const commaIdx = imgData.indexOf(",");
            const b64 = imgData.substring(commaIdx + 1);
            const buf = Buffer.from(b64, "base64");
            console.log("解码大小: " + buf.length + " bytes");
            if (buf.length > 20000) {
              if (!fs.existsSync(bakPath)) fs.copyFileSync(imgPath, bakPath);
              fs.writeFileSync(imgPath, buf);
              console.log("✅ 已覆盖原图!");
              await browser.close();
              return;
            }
          }
        }

        if (candidate.srcStart === "blob:https://") {
          console.log("尝试下载blob图片...");
          const dataUrl = await page.evaluate(async () => {
            const imgs = document.querySelectorAll("img");
            for (const img of imgs) {
              const src = img.src || "";
              if (src.indexOf("blob:") === 0 && img.naturalWidth > 400) {
                try {
                  const resp = await fetch(src);
                  const blob = await resp.blob();
                  return await new Promise((res) => {
                    const reader = new FileReader();
                    reader.onload = () => res(reader.result);
                    reader.readAsDataURL(blob);
                  });
                } catch(e) { return null; }
              }
            }
            return null;
          });
          if (dataUrl && dataUrl.length > 50000) {
            const commaIdx = dataUrl.indexOf(",");
            const b64 = dataUrl.substring(commaIdx + 1);
            const buf = Buffer.from(b64, "base64");
            console.log("解码大小: " + buf.length + " bytes");
            if (buf.length > 20000) {
              if (!fs.existsSync(bakPath)) fs.copyFileSync(imgPath, bakPath);
              fs.writeFileSync(imgPath, buf);
              console.log("✅ 已覆盖原图!");
              await browser.close();
              return;
            }
          }
        }

        if (candidate.srcStart === "https://" && candidate.srcLen > 100) {
          console.log("尝试下载https图片...");
          const dataUrl = await page.evaluate(async () => {
            const imgs = document.querySelectorAll("img");
            for (const img of imgs) {
              const src = img.src || "";
              if (src.indexOf("http") === 0 && img.naturalWidth > 400 && src.length > 100) {
                try {
                  // 用canvas转成data URL
                  const c = document.createElement("canvas");
                  c.width = img.naturalWidth;
                  c.height = img.naturalHeight;
                  const ctx = c.getContext("2d");
                  ctx.drawImage(img, 0, 0);
                  return c.toDataURL("image/jpeg", 0.95);
                } catch(e) { return null; }
              }
            }
            return null;
          });
          if (dataUrl && dataUrl.length > 50000) {
            const buf = Buffer.from(dataUrl.split(",")[1], "base64");
            console.log("解码大小: " + buf.length + " bytes");
            if (buf.length > 20000) {
              if (!fs.existsSync(bakPath)) fs.copyFileSync(imgPath, bakPath);
              fs.writeFileSync(imgPath, buf);
              console.log("✅ 已覆盖原图!");
              await browser.close();
              return;
            }
          }
        }
      }
    }

    if (t % 4 === 0) {
      const recent = state.text.join(" | ");
      console.log("  等待... " + ((t+1)*5) + "s | " + recent.substring(0, 80));
    }
  }

  console.log("❌ 超时");
  await browser.close();
}

main().catch(err => { console.error("错误:", err.message); process.exit(1); });
