const { chromium } = require("playwright");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

// ─── 配置 ────────────────────
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data";
const PROFILE_DIR = "Profile 39";
const CDP_PORT = 9222;
const SHOP_URL = "https://guyuetang.tmall.com/search.htm";
const OUT_DIR = "F:/codex-yunxing/zishahu/data/raw_products";
const MIN_PRICE = 150;
const MAX_PRODUCTS = 100;

function log(m) { console.log("[" + new Date().toISOString().slice(11,19) + "] " + m); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function tmallId(url) { var m = url.match(/id=(\d+)/); return m ? m[1] : null; }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function checkCdpPort() {
  return new Promise(function(resolve) {
    var req = http.get("http://127.0.0.1:" + CDP_PORT + "/json/version", function(res) {
      var d = "";
      res.on("data", function(c) { d += c; });
      res.on("end", function() { resolve(true); });
    });
    req.on("error", function() { resolve(false); });
    req.setTimeout(2000, function() { req.destroy(); resolve(false); });
  });
}

async function waitForCdp() {
  for (var i = 0; i < 40; i++) {
    if (await checkCdpPort()) return true;
    log("   等待CDP就绪 (" + (i+1) + "/40)...");
    await delay(2000);
  }
  return false;
}

async function extractProductData(page, url) {
  log("  打开详情: " + url.slice(0,80));
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await delay(3000);
  } catch(e) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await delay(5000);
    } catch(e2) {
      log("  详情页加载失败: " + url);
      return null;
    }
  }

  var data;
  try {
    data = await page.evaluate(function() {
      var d = document;
      var title = (d.querySelector(".tb-detail-hd h1") || d.querySelector("h1.tb-main-title") || d.querySelector(".detail-title h1"))?.textContent?.trim() || d.title.replace(/-.*$/, "").trim();

      var priceEl = d.querySelector(".tm-price, .tm-promo-price .tm-price, [class*=price] .price-num, .tb-rmb-num");
      var price = parseFloat(priceEl?.textContent?.trim()?.replace(/[^0-9.]/g, "") || "0");

      var origPriceEl = d.querySelector(".tm-original-price .tm-price, .original-price .price");
      var originalPrice = origPriceEl ? parseFloat(origPriceEl.textContent?.trim()?.replace(/[^0-9.]/g, "") || "0") : undefined;
      if (originalPrice && originalPrice <= price) originalPrice = undefined;
      if (originalPrice === 0) originalPrice = undefined;

      var images = [];
      d.querySelectorAll("#J_UlThumb img, .tb-thumb img, .detail-gallery img").forEach(function(img) {
        var src = img.getAttribute("data-src") || img.src || "";
        if (src && src.length > 30 && !src.includes(".gif")) images.push(src.startsWith("//") ? "https:" + src : src);
      });
      if (images.length === 0) {
        d.querySelectorAll("img").forEach(function(img) {
          var s = img.getAttribute("data-src") || img.src || "";
          if (s.includes("alicdn") || s.includes("taobao")) images.push(s.startsWith("//") ? "https:" + s : s);
        });
      }

      var videos = [];
      d.querySelectorAll("video source, video").forEach(function(v) {
        var src = v.src || "";
        if (src && src.length > 10) videos.push(src);
      });
      d.querySelectorAll("[data-video], [data-video-url]").forEach(function(el) {
        var url2 = el.getAttribute("data-video") || el.getAttribute("data-video-url") || "";
        if (url2 && url2.length > 10) videos.push(url2.startsWith("//") ? "https:" + url2 : url2);
      });

      var sourceSku = "";
      d.querySelectorAll(".attributes-list li, .tb-attributes li, [class*=attribute] li").forEach(function(li) {
        var text = li.textContent?.trim() || "";
        if (text.includes("货号") || text.includes("型号")) {
          sourceSku = li.querySelector("span, .attr-value")?.textContent?.trim() || "";
        }
      });

      var reviewEl = d.querySelector(".tb-rate-count, [class*=review] [class*=count], .tm-count");
      var reviewCount = parseInt(reviewEl?.textContent?.trim()?.replace(/[^0-9]/g, "") || "0", 10);

      var shopName = d.querySelector(".tb-shop-name a, .shop-name a, .J_TShopName a")?.textContent?.trim() || "";

      return { title: title, price: price, originalPrice: originalPrice, images: [...new Set(images)].slice(0,10), videos: [...new Set(videos)], sourceSku: sourceSku, reviewCount: reviewCount, shopName: shopName };
    });
  } catch(e) {
    log("  提取异常: " + e.message.substring(0,60));
    return null;
  }

  if (!data || !data.title || data.price <= 0) {
    log("  标题/价格为空，跳过");
    return null;
  }

  var effectivePrice = data.originalPrice || data.price;
  if (effectivePrice < MIN_PRICE) {
    log("  跳过: ¥" + effectivePrice + " < ¥" + MIN_PRICE);
    return null;
  }

  var id = tmallId(url);
  return {
    tmallId: id || "",
    collectedAt: new Date().toISOString(),
    title: data.title,
    price: data.price,
    originalPrice: data.originalPrice,
    mainImages: data.images,
    detailImages: [],
    videos: data.videos,
    skus: [],
    reviewCount: data.reviewCount,
    salesCount: undefined,
    shopName: data.shopName,
    productUrl: url,
    sourceUrl: url,
    sourceSku: data.sourceSku,
    shopUrl: "https://guyuetang.tmall.com",
  };
}

async function main() {
  ensureDir(OUT_DIR);
  log("========================================");
  log("  古月堂商品采集器 (CDP模式)");
  log("========================================\n");

  // 1. Kill Chrome
  log("1. 关闭Chrome进程...");
  try { execSync("taskkill /F /IM chrome.exe", { stdio: "pipe", timeout: 10000 }); log("   Chrome已关闭"); }
  catch(e) { log("   Chrome未运行"); }
  await delay(3000);

  // 2. Start Chrome with CDP
  log("2. 启动Chrome (Profile 39 + CDP端口" + CDP_PORT + ")...");
  var args = [
    "--user-data-dir=\"" + USER_DATA_DIR + "\"",
    "--profile-directory=" + PROFILE_DIR,
    "--remote-debugging-port=" + CDP_PORT,
    "--no-first-run", "--no-default-browser-check",
  ];
  var proc = spawn(CHROME_PATH, args, { detached: true, stdio: "ignore" });
  proc.unref();

  // 3. Wait for CDP
  log("3. 等待CDP就绪...");
  if (!await waitForCdp()) {
    log("  ❌ CDP端口未就绪");
    process.exit(1);
  }
  log("   ✅ CDP已就绪!\n");

  // 4. Connect
  log("4. 连接到真实Chrome...");
  var browser = await chromium.connectOverCDP("http://127.0.0.1:" + CDP_PORT);
  var ctx = browser.contexts()[0];
  var page = ctx ? ctx.pages()[0] || await ctx.newPage() : null;
  if (!page) { log("无法获取页面"); process.exit(1); }
  log("   ✅ 已连接到真实Chrome\n");

  // 5. Navigate to shop
  log("5. 访问古月堂店铺...");
  try { await page.goto(SHOP_URL, { waitUntil: "networkidle", timeout: 60000 }); }
  catch(e) { log("   导航超时(继续): " + e.message.substring(0,60)); }
  await delay(5000);
  var title = await page.title();
  var curl = page.url();
  log("   页面标题: " + title);
  log("   URL: " + curl.substring(0,120));
  if (curl.includes("punish") || curl.includes("login") || title.includes("验证码") || title.includes("登录")) {
    log("\n  ❌ 仍然被拦截! 保存调试页面...");
    var html = await page.content();
    fs.writeFileSync(path.join(OUT_DIR, "_cdp_debug.html"), html.substring(0,100000));
    log("   已保存 _cdp_debug.html");
    await browser.close();
    process.exit(1);
  }
  log("   ✅ 成功访问! 天猫没有拦截真实Chrome!\n");

  // 6. Extract product links
  log("6. 提取商品链接...");
  var links = await page.evaluate(function() {
    var a = document.querySelectorAll("a[href*=detail.tmall.com], a[href*=item.htm]");
    var u = Array.from(a).map(function(x) { return x.href || ""; });
    return [...new Set(u)].filter(Boolean);
  });
  log("   第一轮找到: " + links.length + " 个链接");

  if (links.length === 0) {
    log("   滚动加载更多...");
    for (var i = 0; i < 8; i++) {
      await page.evaluate(function() { window.scrollBy(0, 900); });
      await delay(2000);
    }
    await delay(3000);
    links = await page.evaluate(function() {
      var a = document.querySelectorAll("a[href*=detail.tmall.com], a[href*=item.htm]");
      var u = Array.from(a).map(function(x) { return x.href || ""; });
      return [...new Set(u)].filter(Boolean);
    });
    log("   滚动后找到: " + links.length + " 个链接");
  }

  // Try pagination
  var allLinks = [...links];
  for (var pg = 2; allLinks.length < MAX_PRODUCTS; pg++) {
    var nextUrl = SHOP_URL + (SHOP_URL.includes("?") ? "&" : "?") + "pageNo=" + pg;
    log("   翻页到第" + pg + "页: " + nextUrl);
    try { await page.goto(nextUrl, { waitUntil: "networkidle", timeout: 30000 }); }
    catch(e) { /* ignore timeout */ }
    await delay(3000);
    var pgLinks = await page.evaluate(function() {
      var a = document.querySelectorAll("a[href*=detail.tmall.com], a[href*=item.htm]");
      var u = Array.from(a).map(function(x) { return x.href || ""; });
      return [...new Set(u)].filter(Boolean);
    });
    var newLinks = pgLinks.filter(function(l) { return !allLinks.includes(l); });
    log("   第" + pg + "页找到" + pgLinks.length + "个, 新增" + newLinks.length + "个");
    if (newLinks.length === 0) { log("   没有更多商品了"); break; }
    allLinks = allLinks.concat(newLinks);
  }

  var productLinks = allLinks.slice(0, MAX_PRODUCTS);
  log("   共 " + productLinks.length + " 个待采集商品\n");

  // 7. Visit each product detail page
  log("7. 开始采集商品详情...");
  var collected = 0, skipped = 0, failed = 0;
  var products = [];
  var startTime = Date.now();

  for (var i = 0; i < productLinks.length; i++) {
    var url2 = productLinks[i];
    var id = tmallId(url2);
    if (!id) { failed++; continue; }

    log("\n[" + (i+1) + "/" + productLinks.length + "] id=" + id);

    var prod = await extractProductData(page, url2);
    if (!prod) { failed++; continue; }

    var outPath = path.join(OUT_DIR, id + ".json");
    fs.writeFileSync(outPath, JSON.stringify(prod, null, 2), "utf-8");
    products.push(prod);
    collected++;
    log("   ✅ " + prod.title.substring(0,40) + " (¥" + prod.price + ")" + (prod.videos.length > 0 ? " 🎬" + prod.videos.length + "视频" : ""));

    await delay(3000 + Math.random() * 3000);
  }

  // 8. Summary
  var dur = Math.floor((Date.now() - startTime) / 1000);
  log("\n========================================");
  log("  采集完成!");
  log("  成功: " + collected);
  log("  跳过(¥<" + MIN_PRICE + "): " + skipped);
  log("  失败: " + failed);
  log("  耗时: " + Math.floor(dur/60) + "分" + (dur%60) + "秒");
  log("  输出: " + OUT_DIR);
  log("========================================");

  // 9. Save summary
  var summary = { collectedAt: new Date().toISOString(), total: collected, skipped: skipped, failed: failed, durationSec: dur, shop: "古月堂", shopUrl: SHOP_URL };
  fs.writeFileSync(path.join(OUT_DIR, "_summary.json"), JSON.stringify(summary, null, 2), "utf-8");

  await browser.close();
  log("\n采集结束，Chrome保持运行。现在可以正常使用Chrome。");
}

main().catch(function(e) {
  console.error("致命错误:", e.message);
  process.exit(1);
});