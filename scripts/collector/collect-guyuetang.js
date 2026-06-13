const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const COOKIE_FILE = "F:/codex-yunxing/zishahu/data/raw_products/.taobao_cookies.json";
const OUT_DIR = "F:/codex-yunxing/zishahu/data/raw_products";
const SHOP_URL = "https://guyuetang.tmall.com/search.htm";
const MIN_PRICE = 150;
const MAX_PRODUCTS = 50;

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function tmallId(url) { const m = url.match(/id=(\d+)/); return m ? m[1] : null; }

async function main() {
  console.log("=== 古悦堂商品采集器 ===\n");

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, "utf-8"));
  console.log("加载了", cookies.length, "个cookie");

  // Launch browser - HEADED mode (anti-scraping works better)
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
    (window).chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };
  });

  // Step 1: Navigate to shop page
  console.log("打开店铺页面...");
  await page.goto(SHOP_URL, { waitUntil: "networkidle", timeout: 45000 }).catch(e => {
    console.log("导航超时（可接受）:", e.message.substring(0, 80));
  });
  await delay(5000);
  console.log("页面标题:", await page.title());
  console.log("URL:", page.url());

  // Step 2: Get all product links from the rendered shop page
  console.log("\n提取商品链接...");
  const productLinks = await page.evaluate(() => {
    // Find ALL links pointing to detail.tmall.com
    const anchors = document.querySelectorAll("a[href*='detail.tmall.com']");
    const urls = Array.from(anchors).map(a => a.href || a.getAttribute("href") || "");
    return [...new Set(urls)].filter(Boolean);
  });
  console.log("找到", productLinks.length, "个商品链接");
  productLinks.forEach((l, i) => console.log("  " + (i+1) + ".", l));

  // Limit to max
  const links = productLinks.slice(0, MAX_PRODUCTS);
  console.log("\n将采集", links.length, "个商品");

  // Step 3: Visit each product detail page
  let collected = 0;
  let skipped = 0;
  let failed = 0;
  const products = [];
  const startTime = Date.now();

  for (let i = 0; i < links.length && collected < MAX_PRODUCTS; i++) {
    const url = links[i];
    const id = tmallId(url);
    if (!id) { failed++; continue; }

    console.log("\n[" + (i+1) + "/" + links.length + "] 采集: id=" + id);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 }).catch(e => {
        console.log("  加载超时，继续:", e.message.substring(0, 60));
        return page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      });
      await delay(3000 + Math.random() * 3000);
    } catch (e) {
      console.log("  详情页加载失败:", e.message.substring(0, 60));
      failed++;
      continue;
    }

    // Extract product details
    try {
      const data = await page.evaluate(() => {
        const d = document;

        // Title
        const title = d.querySelector("h1.tb-main-title, .tb-detail-hd h1, .detail-title h1, .main-title, h1[class*='title']")
          ?.textContent?.trim() || d.title.replace(/-.*$/, "").trim();

        // Price - try multiple selectors
        let price = 0;
        const priceEl = d.querySelector(".tm-price, .tm-promo-price .tm-price, [class*='price'] .price-num, .tb-rmb-num");
        if (priceEl) price = parseFloat(priceEl.textContent?.trim()?.replace(/[^0-9.]/g, "") || "0");

        // Original price
        const origPriceEl = d.querySelector(".tm-original-price .tm-price, .original-price .price, .tb-price-original .tb-rmb-num");
        let originalPrice = origPriceEl ? parseFloat(origPriceEl.textContent?.trim()?.replace(/[^0-9.]/g, "") || "0") : undefined;
        if (originalPrice && originalPrice <= price) originalPrice = undefined;
        if (originalPrice === 0) originalPrice = undefined;

        // Main images
        const images = [];
        const imgSelectors = d.querySelectorAll("#J_UlThumb img, .tb-thumb img, .detail-gallery img, .main-img img, .tb-pic a img");
        imgSelectors.forEach((img) => {
          const src = img.getAttribute("data-src") || img.src || "";
          if (src && src.length > 30 && !src.includes(".gif")) {
            images.push(src.startsWith("//") ? "https:" + src : src);
          }
        });
        // Fallback
        if (images.length === 0) {
          d.querySelectorAll("img").forEach((img) => {
            const s = img.getAttribute("data-src") || img.src || "";
            if (s.includes("alicdn") || s.includes("taobao")) {
              images.push(s.startsWith("//") ? "https:" + s : s);
            }
          });
        }

        // Videos
        const videos = [];
        d.querySelectorAll("video source, video").forEach((v) => {
          const src = v.src || (v.querySelector("source")?.src || "");
          if (src && src.length > 10) videos.push(src);
        });
        d.querySelectorAll("[data-video], [data-video-url]").forEach((el) => {
          const url = el.getAttribute("data-video") || el.getAttribute("data-video-url") || "";
          if (url && url.length > 10) videos.push(url.startsWith("//") ? "https:" + url : url);
        });

        // Source SKU (货号)
        let sourceSku = "";
        d.querySelectorAll(".attributes-list li, .tb-attributes li, [class*='attribute'] li, .key-attributes .attr-item").forEach((li) => {
          const text = li.textContent?.trim() || "";
          if (text.includes("货号") || text.includes("型号")) {
            sourceSku = li.querySelector("span, .attr-value")?.textContent?.trim() || "";
          }
        });

        // Review count
        const reviewEl = d.querySelector(".tb-rate-count, [class*='review'] [class*='count'], .tm-count");
        const reviewCount = parseInt(reviewEl?.textContent?.trim()?.replace(/[^0-9]/g, "") || "0", 10);

        // Shop name
        const shopName = d.querySelector(".tb-shop-name a, .shop-name a, .J_TShopName a")?.textContent?.trim() || "";

        return { title, price, originalPrice, images: [...new Set(images)].slice(0, 10), videos: [...new Set(videos)], sourceSku, reviewCount, shopName };
      });

      if (!data.title || data.price <= 0) {
        console.log("  数据提取失败（标题/价格为空），跳过");
        failed++;
        // Try to save page for debugging
        const html = await page.content();
        fs.writeFileSync(OUT_DIR + "/_debug_" + id + ".html", html.substring(0, 50000), "utf-8");
        continue;
      }

      // Price filter
      const effectivePrice = data.originalPrice || data.price;
      if (effectivePrice < MIN_PRICE) {
        console.log("  跳过: ¥" + effectivePrice + " < ¥" + MIN_PRICE);
        skipped++;
        continue;
      }

      const product = {
        tmallId: id,
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

      // Save
      ensureDir(OUT_DIR);
      fs.writeFileSync(path.join(OUT_DIR, id + ".json"), JSON.stringify(product, null, 2), "utf-8");
      products.push(product);
      collected++;
      console.log("  ✅ 已保存: " + data.title + " (¥" + effectivePrice + ")" + (data.videos.length > 0 ? " 🎬" + data.videos.length + "个视频" : ""));

    } catch (e) {
      console.log("  采集异常:", e.message.substring(0, 80));
      failed++;
    }

    // Random delay between products
    await delay(3000 + Math.random() * 4000);
  }

  // Summary
  const duration = Math.floor((Date.now() - startTime) / 1000);
  console.log("\n===========================================");
  console.log("  采集完成！");
  console.log("  成功: " + collected);
  console.log("  跳过(¥<" + MIN_PRICE + "): " + skipped);
  console.log("  失败: " + failed);
  console.log("  耗时: " + Math.floor(duration/60) + "分" + (duration%60) + "秒");
  console.log("  输出: " + OUT_DIR);
  console.log("===========================================\n");

  await browser.close();
}

main().catch(e => {
  console.error("致命错误:", e.message);
  process.exit(1);
});
