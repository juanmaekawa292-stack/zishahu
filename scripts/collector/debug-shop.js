const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const cookieFile = "F:/codex-yunxing/zishahu/data/raw_products/.taobao_cookies.json";
const outDir = "F:/codex-yunxing/zishahu/data/raw_products";

async function main() {
  console.log("Loading cookies from:", cookieFile);
  const cookies = JSON.parse(fs.readFileSync(cookieFile, "utf-8"));
  console.log("Total cookies:", cookies.length);
  console.log("Tmall domains:", [...new Set(cookies.filter(c => c.domain.includes("tmall")).map(c => c.domain))]);
  console.log("Taobao domains:", [...new Set(cookies.filter(c => c.domain.includes("taobao")).map(c => c.domain))]);

  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"]
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });
  await context.addCookies(cookies);

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };
  });

  const shopUrl = "https://guyuetang.tmall.com/search.htm";
  console.log("Navigating to:", shopUrl);

  await page.goto(shopUrl, { waitUntil: "networkidle", timeout: 30000 })
    .catch(e => console.log("Nav timeout:", e.message.substring(0, 100)));
  await page.waitForTimeout(5000);

  const html = await page.content();
  fs.writeFileSync(path.join(outDir, "_debug_shop.html"), html, "utf-8");
  console.log("HTML saved, length:", html.length);

  const title = await page.title();
  console.log("Title:", title);
  console.log("URL:", page.url());

  const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 1000) || "NO BODY");
  console.log("--- Body text (first 1000 chars) ---");
  console.log(bodyText);
  console.log("--- End body ---");

  const links = await page.evaluate(() => {
    const anchors = document.querySelectorAll("a");
    return Array.from(anchors)
      .map(a => a.href)
      .filter(h => h.includes("detail.tmall.com") || h.includes("item.htm"))
      .slice(0, 10);
  });
  console.log("Product links found:", links.length);
  links.forEach((l, i) => console.log("  " + (i+1) + ":", l));

  await browser.close();
}

main().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});