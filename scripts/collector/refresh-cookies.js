const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data";
const PROFILE = "Profile 39";
const COOKIE_FILE = "F:/codex-yunxing/zishahu/data/raw_products/.taobao_cookies.json";
const OUT_DIR = "F:/codex-yunxing/zishahu/data/raw_products";
const PORT = 9222;

async function main() {
  console.log("=== Cookie 刷新工具 ===\n");

  // Step 1: Kill all Chrome processes
  console.log("Step 1: 关闭所有 Chrome 进程...");
  try {
    execSync("taskkill /F /IM chrome.exe", { stdio: "pipe" });
    console.log("  Chrome 进程已关闭");
  } catch (e) {
    console.log("  Chrome 未运行或已关闭");
  }

  // Wait for processes to fully close
  await new Promise(r => setTimeout(r, 3000));

  // Step 2: Start Chrome with remote debugging
  console.log("\nStep 2: 启动 Chrome (Profile " + PROFILE + ", port " + PORT + ")...");
  const chrome = spawn(CHROME, [
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=" + USER_DATA,
    "--profile-directory=" + PROFILE,
    "--no-first-run",
    "--no-default-browser-check",
    "https://guyuetang.tmall.com/search.htm"
  ], { detached: true, stdio: "ignore" });

  console.log("  PID:", chrome.pid);
  console.log("  Waiting for Chrome to start...");
  await new Promise(r => setTimeout(r, 5000));

  // Step 3: Connect via CDP using Playwright
  console.log("\nStep 3: 连接 Chrome via CDP...");
  const { chromium } = require("playwright");

  const browser = await chromium.connectOverCDP("http://127.0.0.1:" + PORT);
  console.log("  已连接");

  // Get the default context
  const defaultContext = browser.contexts()[0];
  const pages = defaultContext.pages();
  const page = pages[0] || await defaultContext.newPage();

  // Navigate if needed
  const currentUrl = page.url();
  console.log("  当前URL:", currentUrl.substring(0, 100));

  if (!currentUrl.includes("guyuetang.tmall.com")) {
    console.log("  导航到店铺页...");
    await page.goto("https://guyuetang.tmall.com/search.htm", {
      waitUntil: "networkidle",
      timeout: 30000
    }).catch(e => console.log("  导航超时:", e.message.substring(0, 60)));
    await page.waitForTimeout(5000);
  } else {
    await page.waitForTimeout(3000);
  }

  console.log("  页面标题:", await page.title());
  console.log("  URL:", page.url().substring(0, 100));

  // Check if logged in
  const isLoginPage = page.url().includes("login.taobao.com");
  if (isLoginPage) {
    console.log("\n⚠️  页面重定向到登录页 - 需要手动登录");
    console.log("  请在 Chrome 窗口中完成淘宝登录");
    console.log("  登录完成后按 Enter 继续...");
    await new Promise(resolve => process.stdin.once("data", () => resolve()));
    await page.waitForTimeout(3000);
  }

  // Step 4: Extract cookies
  console.log("\nStep 4: 提取 Cookie...");
  const cookies = await defaultContext.cookies();
  console.log("  获取到", cookies.length, "个cookie");

  const tbCookies = cookies.filter(c =>
    c.domain.includes("taobao") || c.domain.includes("tmall")
  );
  console.log("  其中淘宝/Tmall:", tbCookies.length, "个");

  // Save cookies
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2), "utf-8");
  console.log("\n  ✅ Cookie 已保存:", COOKIE_FILE);

  // Also save storage state
  const state = await defaultContext.storageState();
  fs.writeFileSync(
    path.join(OUT_DIR, ".taobao_cookies_state.json"),
    JSON.stringify(state, null, 2),
    "utf-8"
  );
  console.log("  ✅ Storage State 已保存");

  await browser.close();

  // Step 5: Kill the debug Chrome
  console.log("\nStep 5: 关闭调试 Chrome...");
  try {
    process.kill(chrome.pid);
    console.log("  Chrome 已关闭");
  } catch (e) {
    console.log("  Chrome 已自行关闭");
  }

  console.log("\n=== Cookie 刷新完成 ===");
}

main().catch(e => {
  console.error("\n错误:", e.message);
  process.exit(1);
});
