const { chromium } = require("playwright");

async function main() {
  // 连接到已经打开的Chrome
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  console.log("已连接Chrome");
  
  const contexts = browser.contexts();
  console.log("Contexts:", contexts.length);
  
  const pages = contexts[0].pages();
  console.log("Pages:", pages.length);
  
  for (const p of pages) {
    const title = await p.title();
    console.log(" -", title.substring(0, 60));
  }
  
  await browser.close();
}

main().catch(console.error);
