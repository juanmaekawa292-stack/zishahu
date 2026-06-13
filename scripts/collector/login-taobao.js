const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const outDir = path.resolve("F:", "codex-yunxing", "zishahu", "data", "raw_products");
const cookieFile = path.join(outDir, ".taobao_cookies.json");
const stateFile = path.join(outDir, ".taobao_cookies_state.json");

fs.mkdirSync(outDir, { recursive: true });

async function main() {
  console.log("\n===================================");
  console.log("  Login helper - Taobao login flow");
  console.log("  1. Browser opens to Taobao login page");
  console.log("  2. Scan QR code with your phone to login");
  console.log("  3. After login, I will navigate to the shop");
  console.log("  4. Press Enter to save cookies");
  console.log("===================================\n");

  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };
  });

  // Go to Taobao login page first (avoids Tmall punish block)
  console.log("Opening Taobao login page...");
  try {
    await page.goto("https://login.taobao.com/member/login.jhtml", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    console.log("Page title:", await page.title());
    console.log("URL:", page.url());
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log("Navigation:", e.message.substring(0, 80));
  }

  console.log("\n-------------------------------------");
  console.log("  BROWSER IS OPEN - LOGIN WITH QR CODE");
  console.log("  1. Scan QR code with your phone");
  console.log("  2. OR use password/短信 to login");
  console.log("  3. After login, come back here");
  console.log("  4. Then press Enter in this terminal");
  console.log("-------------------------------------\n");

  // Wait for user to press Enter after login
  await new Promise((resolve) => process.stdin.once("data", () => resolve()));

  // Verify login by navigating to shop
  console.log("\nNavigating to shop page to verify...");
  try {
    await page.goto("https://guyuetang.tmall.com/search.htm", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("Shop page title:", await page.title());
    console.log("URL:", page.url());
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log("Shop navigation:", e.message.substring(0, 80));
  }

  // Save cookies
  const cookies = await context.cookies();
  fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2), "utf-8");
  const storageState = await context.storageState();
  fs.writeFileSync(stateFile, JSON.stringify(storageState, null, 2), "utf-8");

  const tbCookies = cookies.filter(
    (c) => c.domain.includes("taobao") || c.domain.includes("tmall")
  );
  console.log("\nSaved " + cookies.length + " cookies total");
  console.log("  - " + tbCookies.length + " Taobao/Tmall cookies");
  console.log("Cookie file:", cookieFile);
  console.log("\nLogin session saved! You can now run the shop scraper.");

  await browser.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});