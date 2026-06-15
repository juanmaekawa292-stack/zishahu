const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const page = browser.contexts()[0].pages()[0];

  // 看页面底部文本（最近的消息）
  const text = await page.evaluate(() => {
    const allText = document.body.innerText;
    const lines = allText.split("\n");
    return lines.slice(-30).join("\n");
  });
  console.log("=== 页面最近内容 ===\n" + text + "\n");
  
  // 看是不是有"新对话"按钮
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map(a => ({ text: (a.textContent||"").trim().substring(0,20), href: (a.href||"").substring(0,50) }));
  });
  console.log("=== 链接 ===");
  links.forEach(l => { if (l.text) console.log("  " + l.text + " -> " + l.href); });
  
  await browser.close();
}
main().catch(console.error);
