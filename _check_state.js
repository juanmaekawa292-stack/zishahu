const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];
  
  // 检查页面所有图片
  const imgInfo = await page.evaluate(() => {
    const imgs = document.querySelectorAll("img");
    return Array.from(imgs).map((img, i) => ({
      idx: i,
      w: img.naturalWidth,
      h: img.naturalHeight,
      srcType: (img.src || "").substring(0, 30),
      srcLen: (img.src || "").length,
      complete: img.complete
    }));
  });
  
  console.log("页面图片 (" + imgInfo.length + "张):");
  imgInfo.forEach(i => {
    console.log("  [" + i.idx + "] " + i.w + "x" + i.h + " src=" + i.srcType + "... (" + i.srcLen + " chars, complete=" + i.complete + ")");
  });
  
  await browser.close();
}
main().catch(console.error);
