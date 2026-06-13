const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const outDir = path.resolve("F:", "codex-yunxing", "zishahu", "data", "raw_products");
const cookieFile = path.join(outDir, ".taobao_cookies.json");
const stateFile = path.join(outDir, ".taobao_cookies_state.json");

fs.mkdirSync(outDir, { recursive: true });

async function main() {
  console.log("\n===================================");
  console.log("  Login helper - custom version");
  console.log("  Going directly to Tmall shop");
  console.log("===================================\n");

  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });

  const page = await context.newPage();

  try {
    await page.goto("https://guyuetang.tmall.com/search.htm", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("Shop page title:", await page.title());
    console.log("URL:", page.url());
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log("Navigation done (with timeout):", e.message);
  }

  console.log("\n--- Browser is open ---");
  console.log("If you need to login to Taobao, do it in that window.");
  console.log("Once you see products, press Enter here to save cookies.");
  console.log("------------------------\n");

  await new Promise((resolve) => process.stdin.once("data", () => resolve()));

  const cookies = await context.cookies();
  fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2), "utf-8");
  const storageState = await context.storageState();
  fs.writeFileSync(stateFile, JSON.stringify(storageState, null, 2), "utf-8");

  const tbCookies = cookies.filter(
    (c) => c.domain.includes("taobao") || c.domain.includes("tmall")
  );
  console.log("\nSaved", cookies.length, "cookies total");
  console.log("  -", tbCookies.length, "Taobao/Tmall cookies");
  console.log("Cookie file:", cookieFile);
  console.log("\nDone! You can now run the shop scraper.");

  await browser.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
