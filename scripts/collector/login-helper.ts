/**
 * Taobao login helper
 * Opens a browser for the user to manually log in,
 * then saves the session cookies for reuse.
 *
 * Usage:
 *   npx tsx scripts/collector/login-helper.ts
 *
 * After login, cookies are saved to: data/raw_products/.taobao_cookies.json
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const COOKIE_PATH = path.resolve("data", "raw_products", ".taobao_cookies.json");
const TAOBAO_LOGIN_URL = "https://login.taobao.com/member/login.jhtml";

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log("[" + ts + "] " + msg);
}

async function main() {
  console.log("\n==========================================");
  console.log("  Taobao Login Helper");
  console.log("  Step 1: A browser will open");
  console.log("  Step 2: Log into your Taobao account");
  console.log("  Step 3: Come back here and press Enter");
  console.log("  Step 4: Cookies will be saved");
  console.log("==========================================\n");

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });

  const page = await context.newPage();

  log("Opening Taobao login page...");
  await page.goto(TAOBAO_LOGIN_URL, { waitUntil: "networkidle", timeout: 30000 });

  log("Waiting for you to log in...");
  log("(complete CAPTCHA if needed, then press Enter in this terminal)");

  // Wait for user to press Enter
  await new Promise<void>((resolve) => {
    process.stdin.once("data", () => resolve());
  });

  // After login, navigate to Taobao to get full session cookies
  log("Navigating to Taobao home to verify login...");
  await page.goto("https://www.taobao.com/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const cookies = await context.cookies();
  const cookieDir = path.dirname(COOKIE_PATH);
  if (!fs.existsSync(cookieDir)) {
    fs.mkdirSync(cookieDir, { recursive: true });
  }

  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2), "utf-8");

  // Also save storage state (includes localStorage)
  const storageState = await context.storageState();
  const statePath = COOKIE_PATH.replace(".json", "_state.json");
  fs.writeFileSync(statePath, JSON.stringify(storageState, null, 2), "utf-8");

  log("Cookies saved: " + COOKIE_PATH + " (" + cookies.length + " cookies)");
  log("Storage state saved: " + statePath);

  // Verify login by checking username
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  log("Page after login: " + bodyText.replace(/\n/g, " | ").slice(0, 200));

  await browser.close();
  log("Done! You can now use --cookies mode for collection.");
}

main().catch((err) => {
  console.error("Login helper error:", err.message);
  process.exit(1);
});
