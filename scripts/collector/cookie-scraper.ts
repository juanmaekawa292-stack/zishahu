/**
 * Cookie-based Taobao/Tmall scraper
 *
 * Prerequisite: Run login-helper.ts first to save cookies.
 *
 * Usage:
 *   npx tsx scripts/collector/cookie-scraper.ts
 *   npx tsx scripts/collector/cookie-scraper.ts --max 10
 *   npx tsx scripts/collector/cookie-scraper.ts --keyword 手工紫砂壶
 *   npx tsx scripts/collector/cookie-scraper.ts --detail-item-id 123456789
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const COOKIE_PATH = path.resolve("data", "raw_products", ".taobao_cookies_state.json");
const OUTPUT_DIR = path.resolve("data", "raw_products");

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log("[" + ts + "] " + msg);
}

function logSuccess(msg: string) { console.log("[OK]   " + msg); }
function logWarn(msg: string)  { console.log("[WARN] " + msg); }
function logError(msg: string) { console.log("[ERR]  " + msg); }

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: any = { maxProducts: 5, keyword: "紫砂壶", detailItemId: null };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--max": opts.maxProducts = parseInt(args[++i]) || 5; break;
      case "--keyword": opts.keyword = args[++i]; break;
      case "--detail-item-id": opts.detailItemId = args[++i]; break;
    }
  }
  return opts;
}

async function searchProducts(page: any, keyword: string, maxResults: number): Promise<string[]> {
  const searchUrl = "https://s.taobao.com/search?tab=mall&q=" + encodeURIComponent(keyword);
  log("Searching: " + keyword);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  // Try to get product list
  const links = await page.evaluate(function() {
    // Look for product links in various formats
    var items = document.querySelectorAll(
      "a[href*='item.htm'], " +
      "a[href*='detail.tmall'], " +
      ".J_ClickStat a, " +
      ".item a[href*='item'], " +
      ".product a[href*='item'], " +
      ".title a, " +
      "[class*='pic'] a[href*='item']"
    );
    var found: string[] = [];
    items.forEach(function(a) {
      var href = (a as HTMLAnchorElement).href;
      if (href && href.includes("item.htm") && !found.includes(href)) {
        found.push(href);
      }
    });
    return found.slice(0, 50);
  });

  log("Found " + links.length + " product links");
  return links.slice(0, maxResults);
}

async function scrapeDetail(page: any, url: string) {
  log("Opening detail: " + url.slice(0, 80) + "...");
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  const data = await page.evaluate(function() {
    var title = "";
    var selectors = ["h1", ".tb-detail-hd h1", ".detail-title h1", ".main-title", "title"];
    for (var s of selectors) {
      var el = document.querySelector(s);
      if (el && el.textContent) { title = el.textContent.trim(); break; }
    }

    var price = 0;
    var priceEls = document.querySelectorAll(".tm-price, .tm-promo-price .tm-price, [class*='price']");
    for (var i = 0; i < priceEls.length; i++) {
      var t = (priceEls[i].textContent || "").trim().replace(/[^0-9.]/g, "");
      var n = parseFloat(t);
      if (!isNaN(n) && n > 0) { price = n; break; }
    }

    var images: string[] = [];
    var imgEls = document.querySelectorAll("#J_UlThumb img, .tb-thumb img, .detail-gallery img, img[data-src*='alicdn']");
    imgEls.forEach(function(img) {
      var src = (img as HTMLImageElement).getAttribute("data-src") || (img as HTMLImageElement).src || "";
      if (src && src.length > 30 && !images.includes(src)) images.push(src);
    });

    var bodyText = document.body.innerText.slice(0, 500);

    return {
      title: title,
      price: price,
      images: images.slice(0, 5),
      bodyPreview: bodyText,
      url: window.location.href,
      loaded: !bodyText.includes("登录") && !bodyText.includes("请登录"),
    };
  });

  return data;
}

async function main() {
  const opts = parseArgs();

  // Check cookies
  if (!fs.existsSync(COOKIE_PATH)) {
    logError("No saved cookies found at " + COOKIE_PATH);
    logError("Please run login-helper.ts first:");
    logError("  npx tsx scripts/collector/login-helper.ts");
    process.exit(1);
  }

  log("Loading cookies from: " + COOKIE_PATH);
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  // Create context with saved storage state
  const context = await browser.newContext({
    storageState: COOKIE_PATH,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });

  const page = await context.newPage();
  await page.addInitScript(function() {
    Object.defineProperty(navigator, "webdriver", { get: function() { return false; } });
    Object.defineProperty(navigator, "plugins", { get: function() { return [1,2,3,4,5]; } });
  });

  // Single product detail mode
  if (opts.detailItemId) {
    const url = "https://detail.tmall.com/item.htm?id=" + opts.detailItemId;
    log("Testing single item: " + url);
    const data = await scrapeDetail(page, url);
    console.log(JSON.stringify(data, null, 2));
    if (data.loaded) {
      logSuccess("Product loaded successfully with cookies!");
      // Save result
      const outPath = path.join(OUTPUT_DIR, "detail_" + opts.detailItemId + ".json");
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
      logSuccess("Saved to: " + outPath);
    } else {
      logWarn("Product page shows login/session expired");
    }
    await browser.close();
    return;
  }

  // Full search + scrape mode
  log("=== Starting cookie-based collection ===");
  log("Keyword: " + opts.keyword);
  log("Max: " + opts.maxProducts);

  // First verify login session
  log("Verifying session...");
  await page.goto("https://www.taobao.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);
  var homeText = await page.evaluate(function() { return document.body.innerText.slice(0, 500); });
  var loggedIn = homeText.includes("我的淘宝") || homeText.includes("已买到的宝贝") || !homeText.includes("亲，请登录");
  log("Logged in: " + loggedIn);

  if (!loggedIn) {
    logWarn("Session expired or not logged in");
    logWarn("Please re-run: npx tsx scripts/collector/login-helper.ts");
    await browser.close();
    return;
  }

  // Search products
  const links = await searchProducts(page, opts.keyword, opts.maxProducts);
  logSuccess("Found " + links.length + " products");

  // Scrape each product detail
  var results: any[] = [];
  for (var i = 0; i < links.length; i++) {
    log("Scraping " + (i + 1) + "/" + links.length + "...");
    var data = await scrapeDetail(page, links[i]);
    if (data.loaded) {
      results.push(data);
      logSuccess("OK: " + (data.title || "untitled").slice(0, 40));
      // Save individual result
      var idMatch = links[i].match(/id=(\d+)/);
      var itemId = idMatch ? idMatch[1] : "item_" + i;
      fs.writeFileSync(
        path.join(OUTPUT_DIR, itemId + ".json"),
        JSON.stringify(data, null, 2),
        "utf-8"
      );
    } else {
      logWarn("Failed to load product " + (i + 1));
    }
    // Delay between requests
    await new Promise(function(r) { setTimeout(r, 2000 + Math.random() * 3000); });
  }

  logSuccess("\nCollection complete! " + results.length + "/" + links.length + " products saved.");
  log("Output: " + OUTPUT_DIR);

  await browser.close();
}

main().catch(function(err) {
  logError("Fatal: " + err.message);
  process.exit(1);
});
