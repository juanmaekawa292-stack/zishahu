/**
 * Tmall zisha search test script (plain JS, no TS)
 * Run with: node scripts/collector/test-tmall.mjs
 *
 * Tests the basic Tmall access and records anti-scraping behavior.
 */
import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = path.resolve("data", "raw_products");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Log helper
function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log("[" + ts + "] " + msg);
}

async function testTmallAccess(useStealth, url, label) {
  log("=== Test: " + label + " (stealth=" + useStealth + ") ===");

  const launchOpts = {
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  };
  const browser = await chromium.launch(launchOpts);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });

  const page = await context.newPage();

  if (useStealth) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, "languages", {
        get: () => ["zh-CN", "zh", "en"],
      });
    });
  }

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(3000);

    const title = await page.title();
    const currentUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1500));

    log("URL: " + currentUrl);
    log("Title: " + title);
    log("Body: " + bodyText.replace(/\n/g, " | ").slice(0, 400));

    // Check for anti-scraping signals
    const signals = {
      captcha: /验证|滑块|安全验证|captcha|拖动|verify/i.test(bodyText),
      redirect: !currentUrl.includes(url.split("/")[2]),
      mobileVersion: /桌面版|mobile|m\.taobao/i.test(currentUrl) || bodyText.includes("桌面版"),
      loading: bodyText.includes("加载中"),
      emptyResult: bodyText.includes("没有找到") || bodyText.includes("0个商品"),
    };

    log("Signals: " + JSON.stringify(signals));

    // Count product items
    const itemCount = await page.evaluate(() => {
      const selectors = [
        ".productItem", ".item", ".product",
        "[class*='product-item']", "[class*='Product']",
        ".J_MouserOnverReq", ".grid-item",
        "div[data-category]", "li[data-index]",
      ];
      for (const sel of selectors) {
        const items = document.querySelectorAll(sel);
        if (items.length > 1) return items.length;
      }
      return 0;
    });

    log("Product items found: " + itemCount);

    // Save HTML snapshot
    const safeLabel = label.replace(/[^a-z0-9]/gi, "_");
    const html = await page.evaluate(() => document.body.outerHTML.slice(0, 5000));
    fs.writeFileSync(path.join(OUTPUT_DIR, "_debug_" + safeLabel + ".html"), html, "utf-8");

  } catch (err) {
    log("Error: " + err.message);
  }

  await browser.close();
  log("=== End: " + label + " ===\n");
}

async function main() {
  log("Tmall access test suite starting...\n");

  // Test 1: Tmall search with stealth
  await testTmallAccess(true,
    "https://list.tmall.com/search_product.htm?q=%E7%B4%AB%E7%A0%82%E5%A3%B6",
    "Tmall Search (stealth)"
  );

  // Test 2: Taobao search filtered to Tmall
  await testTmallAccess(true,
    "https://s.taobao.com/search?tab=mall&q=%E7%B4%AB%E7%A0%82%E5%A3%B6",
    "Taobao-Mall Search (stealth)"
  );

  // Test 3: Taobao general search
  await testTmallAccess(true,
    "https://s.taobao.com/search?q=%E7%B4%AB%E7%A0%82%E5%A3%B6",
    "Taobao General Search (stealth)"
  );

  log("All tests completed!");
}

main().catch(console.error);
