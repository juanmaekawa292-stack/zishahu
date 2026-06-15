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

  // 先记录当前的图片快照，之后好对比
  const beforeSnapshot = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).map(i => ({
      srcLen: (i.src || "").length,
      w: i.naturalWidth,
      h: i.naturalHeight
    }));
  });
  console.log("当前图片数: " + beforeSnapshot.length);

  // 1. 上传图片
  const fileInput = await page.$("input[type=file]");
  if (!fileInput) { console.log("找不到file input"); return; }
  await fileInput.setInputFiles(imgPath);
  console.log("✅ 已上传");
  await sleep(5000);

  // 2. 输入指令
  const textarea = await page.$("textarea");
  if (!textarea) { console.log("找不到textarea"); return; }
  await textarea.click();
  await textarea.fill("");
  await page.keyboard.type("帮我去除有关天猫淘宝拼多多 的水印图标，还有活动的水印", { delay: 30 });
  console.log("✅ 指令已输入");
  await sleep(1000);

  // 3. 发送
  await page.keyboard.press("Enter");
  console.log("已发送，等待AI响应...\n");

  // 4. 等待AI生成 - 检测新出现的图片
  for (let t = 0; t < 60; t++) {
    await sleep(5000);

    const state = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs).map(i => ({
        srcType: (i.src || "").substring(0, 10),
        srcLen: (i.src || "").length,
        w: i.naturalWidth,
        h: i.naturalHeight,
        complete: i.complete
      }));
    });

    // 找新的候选图片（比之前的快照多出来的，或是尺寸大的）
    const newLarge = state.filter(s => {
      if (s.srcType === "data:image" && s.srcLen > 5000 && s.w > 300) {
        // 检查是否在旧快照中不存在
        const existed = beforeSnapshot.some(b => b.srcLen === s.srcLen);
        return !existed;
      }
      return false;
    });

    // 也找HTTP blob等格式
    const blobUrls = state.filter(s => s.srcType === "blob:https:" && s.w > 300);

    const allText = await page.evaluate(() => document.body.innerText);
    const lastLines = allText.split("\n").slice(-10).join("\n");

    if (newLarge.length > 0) {
      console.log("✅ 发现新生成的data image! " + newLarge[0].w + "x" + newLarge[0].h);
      // 需要找到对应img元素获取完整src
      const imgData = await page.evaluate(() => {
        const imgs = document.querySelectorAll("img");
        for (const img of imgs) {
          const src = img.src || "";
          if (src.indexOf("data:image") === 0 && src.length > 5000 && img.naturalWidth > 300) {
            return { src, w: img.naturalWidth, h: img.naturalHeight };
          }
        }
        return null;
      });

      if (imgData) {
        const commaIdx = imgData.src.indexOf(",");
        const base64Data = imgData.src.substring(commaIdx + 1);
        const buf = Buffer.from(base64Data, "base64");
        console.log("图片数据: " + buf.length + " bytes");

        if (buf.length > 10000) {
          if (!fs.existsSync(bakPath)) { fs.copyFileSync(imgPath, bakPath); }
          fs.writeFileSync(imgPath, buf);
          console.log("✅ 已覆盖原图!");
          await browser.close();
          return;
        }
      }
    }

    if (t % 6 === 0) {
      console.log("  等待... " + ((t+1)*5) + "s");
      console.log("  最近内容: " + lastLines.substring(0, 100).replace(/\n/g, " "));
    }
  }

  console.log("❌ 超时");
  await browser.close();
}

main().catch(err => { console.error("错误:", err.message); process.exit(1); });
