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
  const page = browser.contexts()[0].pages()[0];
  console.log("页面: " + (await page.title()));

  // 新对话 - 点击"主对话"链接
  console.log("开新对话...");
  await page.click("a[href*='/chat/308837339896834']");
  await sleep(4000);
  console.log("  已切换");

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

  // 等待AI结果
  for (let t = 0; t < 80; t++) {
    await sleep(5000);

    const state = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return {
        imgs: Array.from(imgs).map(i => ({
          s: (i.src || "").substring(0, 15),
          sl: (i.src || "").length,
          w: i.naturalWidth,
          h: i.naturalHeight
        })),
        text: document.body.innerText.split("\n").filter(l => l.trim()).slice(-5)
      };
    });

    // 找出所有 >50KB 的 data:image
    const bigDataImg = state.imgs.filter(i => i.s === "data:image" && i.sl > 50000 && i.w > 400);
    // 找出所有大于400x400的blob
    const bigBlob = state.imgs.filter(i => i.s === "blob:https://" && i.w > 400);
    // 找出所有 >400x400 的外部图片
    const bigHttp = state.imgs.filter(i => i.s === "https://" && i.w > 400 && i.w < 5000);

    const recent = state.text.join(" | ");

    if (bigDataImg.length > 0) {
      console.log("✅ 发现大data图片! " + bigDataImg[0].w + "x" + bigDataImg[0].h + " " + Math.round(bigDataImg[0].sl/1024) + "KB");
      const dataUrl = await page.evaluate(() => {
        const imgs = document.querySelectorAll("img");
        for (const img of imgs) {
          const src = img.src || "";
          if (src.indexOf("data:image") === 0 && src.length > 50000) return src;
        }
        return null;
      });
      if (dataUrl) {
        const buf = Buffer.from(dataUrl.split(",")[1], "base64");
        console.log("解码: " + buf.length + " bytes");
        if (!fs.existsSync(bakPath)) fs.copyFileSync(imgPath, bakPath);
        fs.writeFileSync(imgPath, buf);
        console.log("✅ 已覆盖原图!");
      } else { console.log("获取dataUrl失败"); }
      break;
    }

    if (bigHttp.length > 0) {
      console.log("发现外部图片 " + bigHttp[0].w + "x" + bigHttp[0].h);
      const imgData = await page.evaluate(async () => {
        const imgs = document.querySelectorAll("img");
        for (const img of imgs) {
          const src = img.src || "";
          if (src.indexOf("http") === 0 && img.naturalWidth > 400 && img.naturalWidth < 5000) {
            try {
              const c = document.createElement("canvas");
              c.width = img.naturalWidth;
              c.height = img.naturalHeight;
              c.getContext("2d").drawImage(img, 0, 0);
              return c.toDataURL("image/jpeg", 0.92);
            } catch(e) { return null; }
          }
        }
        return null;
      });
      if (imgData && imgData.length > 50000) {
        const buf = Buffer.from(imgData.split(",")[1], "base64");
        console.log("解码: " + buf.length + " bytes");
        if (!fs.existsSync(bakPath)) fs.copyFileSync(imgPath, bakPath);
        fs.writeFileSync(imgPath, buf);
        console.log("✅ 已覆盖原图!");
        break;
      }
    }

    if (bigBlob.length > 0) {
      console.log("发现blob图片 " + bigBlob[0].w + "x" + bigBlob[0].h);
      const dataUrl = await page.evaluate(async () => {
        const imgs = document.querySelectorAll("img");
        for (const img of imgs) {
          const src = img.src || "";
          if (src.indexOf("blob:") === 0 && img.naturalWidth > 400) {
            try {
              const resp = await fetch(src);
              const blob = await resp.blob();
              return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
            } catch(e) { return null; }
          }
        }
        return null;
      });
      if (dataUrl && dataUrl.length > 50000) {
        const buf = Buffer.from(dataUrl.split(",")[1], "base64");
        console.log("解码: " + buf.length + " bytes");
        if (!fs.existsSync(bakPath)) fs.copyFileSync(imgPath, bakPath);
        fs.writeFileSync(imgPath, buf);
        console.log("✅ 已覆盖原图!");
        break;
      }
    }

    if (t % 4 === 0) console.log("  等待... " + ((t+1)*5) + "s | " + recent.substring(0, 80));
  }

  await browser.close();
}

main().catch(err => { console.error("错误:", err.message); process.exit(1); });
