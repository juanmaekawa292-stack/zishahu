const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];
  
  // 获取页面主要元素
  const textarea = await page.$("textarea");
  console.log("Textarea exists:", !!textarea);
  
  const fileInput = await page.$("input[type=file]");
  console.log("File input exists:", !!fileInput);
  
  // 获取所有可见的链接/按钮文本
  const elements = await page.evaluate(() => {
    // 查找所有可点击元素
    const items = [];
    document.querySelectorAll("a, button, [role=button], [tabindex]").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        items.push({
          tag: el.tagName,
          text: (el.textContent || "").trim().substring(0, 40),
          cls: (el.className || "").substring(0, 40),
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        });
      }
    });
    return items;
  });
  
  // 筛选出有文本的元素
  const withText = elements.filter(e => e.text.length > 0);
  console.log("\n=== Interactive elements with text ===");
  withText.forEach(e => {
    console.log(`${e.tag} "${e.text}" at (${e.x},${e.y}) ${e.w}x${e.h}`);
  });
  
  await browser.close();
}

main().catch(console.error);
