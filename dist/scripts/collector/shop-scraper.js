"use strict";
/**
 * 店铺采集器 - Shop Scraper
 *
 * 专门采集天猫店铺的所有商品（如 guyuetang.tmall.com）
 * 支持：翻页、视频、货号、价格过滤、Source 追踪
 *
 * Usage:
 *   npx tsx scripts/collector/shop-scraper.ts --shop-url "https://guyuetang.tmall.com/search.htm"
 *   npx tsx scripts/collector/shop-scraper.ts --shop-url "..." --max 30 --headless --min-price 150
 *   npx tsx scripts/collector/shop-scraper.ts --shop-url "..." --login  # 先用浏览器登录
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const browser_1 = require("./browser");
const utils_1 = require("./utils");
const output_1 = require("./output");
// ─── 配置 ─────────────────────────────────────────────
const OUTPUT_DIR = path.resolve(process.cwd(), "data", "raw_products");
const DEFAULT_MIN_PRICE = 150; // RMB ¥150 以下跳过
const DEFAULT_MAX = 50;
const COOKIE_PATH = path.resolve(OUTPUT_DIR, ".taobao_cookies.json");
const COOKIE_STATE_PATH = path.resolve(OUTPUT_DIR, ".taobao_cookies_state.json");
// ─── 入口参数解析 ─────────────────────────────────────
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {};
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--shop-url":
                opts.shopUrl = args[++i];
                break;
            case "--max":
                opts.maxProducts = parseInt(args[++i], 10) || DEFAULT_MAX;
                break;
            case "--headless":
                opts.headless = true;
                break;
            case "--min-price":
                opts.minPrice = parseFloat(args[++i]) || DEFAULT_MIN_PRICE;
                break;
            case "--login":
                opts.loginMode = true;
                break;
            case "--cookies":
                opts.cookies = args[++i];
                break;
            case "--output":
                opts.outputDir = args[++i];
                break;
        }
    }
    return opts;
}
// ─── 浏览器创建 ───────────────────────────────────────
async function createShopBrowser(config) {
    const launchOptions = {
        headless: config.headless,
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--window-size=1920,1080",
        ],
    };
    const browser = await playwright_1.chromium.launch(launchOptions);
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport: { width: 1920, height: 1080 },
        locale: "zh-CN",
        timezoneId: "Asia/Shanghai",
        deviceScaleFactor: 2,
    });
    // 加载已保存的 cookies
    if (fs.existsSync(COOKIE_STATE_PATH)) {
        try {
            const state = JSON.parse(fs.readFileSync(COOKIE_STATE_PATH, "utf-8"));
            if (state.cookies && state.cookies.length > 0) {
                await context.addCookies(state.cookies);
                (0, utils_1.logInfo)("已加载 " + state.cookies.length + " 个 cookie");
            }
        }
        catch (e) {
            (0, utils_1.logWarn)("cookie 加载失败: " + e.message);
        }
    }
    else if (fs.existsSync(COOKIE_PATH)) {
        try {
            const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, "utf-8"));
            await context.addCookies(cookies);
            (0, utils_1.logInfo)("已加载 " + cookies.length + " 个 cookie");
        }
        catch (e) {
            (0, utils_1.logWarn)("cookie 加载失败: " + e.message);
        }
    }
    return { browser, context };
}
// ─── 登录模式 ─────────────────────────────────────────
async function loginMode(shopUrl) {
    (0, utils_1.logInfo)("启动登录模式...");
    (0, utils_1.logInfo)("1. 浏览器将打开，请手动登录淘宝账号");
    (0, utils_1.logInfo)("2. 登录后在终端按 Enter 继续");
    (0, utils_1.logInfo)("3. Cookie 将被保存，后续采集自动使用");
    const browser = await playwright_1.chromium.launch({
        headless: false,
        args: ["--disable-blink-features=AutomationControlled"],
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: "zh-CN",
        timezoneId: "Asia/Shanghai",
    });
    const page = await context.newPage();
    await (0, browser_1.injectAntiDetect)(page);
    await page.goto("https://login.taobao.com/member/login.jhtml", {
        waitUntil: "networkidle",
        timeout: 60000,
    });
    (0, utils_1.logInfo)("请完成淘宝登录...");
    await new Promise((resolve) => {
        process.stdin.once("data", () => resolve());
    });
    // 导航到店铺验证
    await page.goto(shopUrl, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    const cookies = await context.cookies();
    (0, utils_1.ensureDir)(OUTPUT_DIR);
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2), "utf-8");
    (0, utils_1.logSuccess)("Cookie 已保存: " + COOKIE_PATH);
    await browser.close();
    (0, utils_1.logSuccess)("登录完成！下次直接采集即可。");
}
// ─── 店铺商品链接提取 ────────────────────────────────
async function extractShopProductLinks(page, shopUrl, maxProducts) {
    var _a;
    const allLinks = [];
    let currentPage = 1;
    while (allLinks.length < maxProducts) {
        // 构造分页 URL（天猫店铺搜索页）
        const sep = shopUrl.includes("?") ? "&" : "?";
        const pageUrl = shopUrl + sep + "pageNo=" + currentPage + "&pageSize=60";
        (0, utils_1.logInfo)("正在访问店铺页 " + currentPage + ": " + pageUrl);
        try {
            await page.goto(pageUrl, {
                waitUntil: "networkidle",
                timeout: 45000,
            });
            await (0, browser_1.randomDelay)(3000, 5000);
        }
        catch (e) {
            (0, utils_1.logWarn)("店铺页加载超时，继续尝试: " + e.message);
            await page.waitForTimeout(5000);
        }
        // 提取商品链接（多选择器）
        const links = await page.evaluate(() => {
            const selector = [
                'a[href*="detail.tmall.com"]',
                'a[href*="detail.tmall.hk"]',
                'a[href*="item.htm"]',
                ".productImg-wrap a",
                "a.product-link",
                "a[class*='product']",
                "[class*='item'] a[href*='detail']",
                "[class*='Item'] a[href*='detail']",
            ].join(", ");
            const anchors = document.querySelectorAll(selector);
            return Array.from(anchors)
                .map((a) => a.href || a.getAttribute("href") || "")
                .filter((href) => href.includes("item.htm") || href.includes("detail"))
                .filter((v, i, a) => a.indexOf(v) === i);
        });
        (0, utils_1.logInfo)("第 " + currentPage + " 页找到 " + links.length + " 个商品链接");
        for (const link of links) {
            const fullUrl = link.startsWith("//") ? "https:" + link : link.startsWith("/") ? ((_a = shopUrl.match(/https?:\/\/[^\/]+/)) === null || _a === void 0 ? void 0 : _a[0]) + link : link;
            if (fullUrl && !allLinks.includes(fullUrl)) {
                allLinks.push(fullUrl);
                if (allLinks.length >= maxProducts)
                    break;
            }
        }
        // 检查是否有下一页
        const hasNext = await checkHasNextPage(page);
        if (!hasNext || links.length === 0) {
            (0, utils_1.logInfo)("没有更多页了，共 " + currentPage + " 页");
            break;
        }
        currentPage++;
        await (0, browser_1.randomDelay)(2000, 4000);
    }
    return allLinks.slice(0, maxProducts);
}
// ─── 翻页检测 ─────────────────────────────────────────
async function checkHasNextPage(page) {
    return page.evaluate(() => {
        var _a;
        const nextSelectors = [
            ".page-next:not(.disabled)",
            ".ui-page-next:not(.disabled)",
            ".next:not(.disabled)",
            "a.next:not(.disabled)",
            "[class*='next']:not([class*='disable'])",
            ".pagination .next:not(.disabled)",
        ];
        for (const sel of nextSelectors) {
            const el = document.querySelector(sel);
            if (el && !el.classList.contains("disabled")) {
                return true;
            }
        }
        // 检查页码链接
        const pageItems = document.querySelectorAll(".page-item, .pagination a, [class*='page'] a");
        if (pageItems.length > 0) {
            const last = pageItems[pageItems.length - 1];
            const text = ((_a = last.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            const href = last.href || "";
            return text.includes("下一页") || text.includes(">") || href.includes("pageNo=");
        }
        return false;
    });
}
// ─── 商品详情采集（含视频 + 货号） ─────────────────
async function scrapeShopProductDetail(page, productUrl, config) {
    var _a;
    const tmallId = (0, utils_1.extractTmallId)(productUrl);
    if (!tmallId) {
        (0, utils_1.logWarn)("无法提取商品 ID: " + productUrl);
        return null;
    }
    (0, utils_1.logInfo)("采集商品: " + productUrl);
    // 加载详情页
    try {
        await page.goto(productUrl, { waitUntil: "networkidle", timeout: 45000 });
        await (0, browser_1.randomDelay)(3000, 6000);
        await page.waitForTimeout(2000);
    }
    catch (e) {
        (0, utils_1.logWarn)("加载详情页超时: " + e.message);
        try {
            await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
            await page.waitForTimeout(5000);
        }
        catch (e2) {
            (0, utils_1.logError)("详情页加载失败: " + productUrl + " - " + e2.message);
            return null;
        }
    }
    try {
        // 批量提取字段
        const detailData = await page.evaluate(() => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const doc = document;
            // 标题
            const title = ((_b = (_a = (doc.querySelector(".tb-detail-hd h1") ||
                doc.querySelector("h1.tb-main-title") ||
                doc.querySelector(".detail-title h1") ||
                doc.querySelector(".main-title") ||
                doc.querySelector("h1[class*='title']"))) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || doc.title.replace(/-.*$/, "").trim();
            // 价格
            const priceEl = doc.querySelector(".tm-price, .tm-promo-price .tm-price, [class*='price'] .price-num, .tb-rmb-num");
            const price = parseFloat(((_d = (_c = priceEl === null || priceEl === void 0 ? void 0 : priceEl.textContent) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.replace(/[^0-9.]/g, "")) || "0");
            // 原价
            const origPriceEl = doc.querySelector(".tm-original-price .tm-price, .original-price .price, .tb-price-original .tb-rmb-num, .market-price .tm-price");
            const originalPrice = origPriceEl ? parseFloat(((_f = (_e = origPriceEl.textContent) === null || _e === void 0 ? void 0 : _e.trim()) === null || _f === void 0 ? void 0 : _f.replace(/[^0-9.]/g, "")) || "0") : undefined;
            // 主图
            const images = [];
            const galleryImgs = doc.querySelectorAll("#J_UlThumb img, .tb-thumb img, .detail-gallery img, .main-img img");
            galleryImgs.forEach((img) => {
                const src = img.getAttribute("data-src") || img.src || "";
                if (src && src.length > 30 && !src.includes(".gif")) {
                    images.push(src.startsWith("//") ? "https:" + src : src);
                }
            });
            // 兜底：找所有图片
            if (images.length === 0) {
                doc.querySelectorAll("img").forEach((img) => {
                    const s = img.getAttribute("data-src") || img.src || "";
                    if (s.includes("alicdn") || s.includes("taobao")) {
                        images.push(s.startsWith("//") ? "https:" + s : s);
                    }
                });
            }
            // 视频链接
            const videos = [];
            // 尝试 video 标签
            doc.querySelectorAll("video source, video").forEach((v) => {
                const src = v.src || v.src || "";
                if (src && src.length > 10)
                    videos.push(src);
            });
            // 尝试 data-video 属性
            doc.querySelectorAll("[data-video], [data-video-url]").forEach((el) => {
                const url = el.getAttribute("data-video") || el.getAttribute("data-video-url") || "";
                if (url && url.length > 10)
                    videos.push(url.startsWith("//") ? "https:" + url : url);
            });
            // 货号（sourceSku）
            let sourceSku = "";
            // 从属性表查找
            const attrItems = doc.querySelectorAll(".attributes-list li, .tb-attributes li, [class*='attribute'] li, .key-attributes .attr-item");
            attrItems.forEach((li) => {
                var _a, _b, _c;
                const text = ((_a = li.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                if (text.includes("货号") || text.includes("型号") || text.includes("编号")) {
                    const val = ((_c = (_b = li.querySelector("span, .attr-value")) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || "";
                    if (val)
                        sourceSku = val;
                }
            });
            // 评价数
            const reviewEl = doc.querySelector(".tb-rate-count, [class*='review'] [class*='count'], .tm-count");
            const reviewCount = parseInt(((_h = (_g = reviewEl === null || reviewEl === void 0 ? void 0 : reviewEl.textContent) === null || _g === void 0 ? void 0 : _g.trim()) === null || _h === void 0 ? void 0 : _h.replace(/[^0-9]/g, "")) || "0", 10);
            // 店铺名
            const shopName = ((_k = (_j = doc.querySelector(".tb-shop-name a, .shop-name a, .J_TShopName a")) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim()) || "";
            return {
                title,
                price,
                originalPrice: originalPrice && originalPrice > 0 ? originalPrice : undefined,
                images: [...new Set(images)].slice(0, 10),
                videos: [...new Set(videos)].slice(0, 5),
                sourceSku,
                reviewCount,
                shopName,
            };
        });
        if (!detailData.title || detailData.price <= 0) {
            (0, utils_1.logWarn)("详情提取失败: " + tmallId);
            return null;
        }
        // 价格过滤：低于最低价跳过
        const effectivePrice = detailData.originalPrice || detailData.price;
        if (effectivePrice < config.minPrice) {
            (0, utils_1.logInfo)("  跳过: ¥" + effectivePrice + " < ¥" + config.minPrice + " (最低价限制)");
            return null;
        }
        return {
            tmallId,
            collectedAt: new Date().toISOString(),
            title: detailData.title,
            price: detailData.price,
            originalPrice: detailData.originalPrice,
            mainImages: detailData.images,
            detailImages: [],
            videos: detailData.videos,
            skus: [],
            reviewCount: detailData.reviewCount,
            salesCount: undefined,
            shopName: detailData.shopName,
            productUrl: productUrl,
            sourceSku: detailData.sourceSku,
            shopUrl: ((_a = productUrl.match(/https?:\/\/[^\/]+/)) === null || _a === void 0 ? void 0 : _a[0]) || "",
        };
    }
    catch (e) {
        (0, utils_1.logError)("采集商品详情失败: " + tmallId + " - " + e.message);
        return null;
    }
}
// ─── 主流程 ───────────────────────────────────────────
async function main() {
    var _a;
    const opts = parseArgs();
    // 登录模式
    if (opts.loginMode) {
        if (!opts.shopUrl) {
            console.log("请提供 --shop-url 参数（登录后跳转到店铺验证）");
            process.exit(1);
        }
        await loginMode(opts.shopUrl);
        return;
    }
    // 检查必要参数
    if (!opts.shopUrl) {
        console.log("\n用法:");
        console.log("  npx tsx scripts/collector/shop-scraper.ts --shop-url <URL> [选项]");
        console.log("");
        console.log("必须参数:");
        console.log("  --shop-url <URL>    天猫店铺搜索页URL (如 https://guyuetang.tmall.com/search.htm)");
        console.log("");
        console.log("可选参数:");
        console.log("  --headless          无头模式（默认有界面）");
        console.log("  --max <N>           最大采集数（默认50）");
        console.log("  --min-price <N>     最低价格RMB（默认150）");
        console.log("  --login             先登录淘宝保存cookie");
        console.log("  --cookies <path>    指定cookie文件路径");
        console.log("  --output <dir>      输出目录");
        console.log("  --help              显示帮助");
        console.log("");
        console.log("示例:");
        console.log("  npx tsx scripts/collector/shop-scraper.ts --shop-url \"https://guyuetang.tmall.com/search.htm\"");
        console.log("  npx tsx scripts/collector/shop-scraper.ts --shop-url \"...\" --headless --max 30 --min-price 200");
        process.exit(0);
    }
    const config = {
        shopUrl: opts.shopUrl,
        maxProducts: opts.maxProducts || DEFAULT_MAX,
        headless: (_a = opts.headless) !== null && _a !== void 0 ? _a : false,
        minPrice: opts.minPrice || DEFAULT_MIN_PRICE,
        loginMode: false,
        outputDir: opts.outputDir || OUTPUT_DIR,
    };
    (0, utils_1.ensureDir)(config.outputDir);
    (0, utils_1.logInfo)("=== 店铺采集器 ===");
    (0, utils_1.logInfo)("店铺URL: " + config.shopUrl);
    (0, utils_1.logInfo)("最大采集: " + config.maxProducts);
    (0, utils_1.logInfo)("最低价格: ¥" + config.minPrice);
    (0, utils_1.logInfo)("无头模式: " + (config.headless ? "是" : "否"));
    (0, utils_1.logInfo)("输出目录: " + config.outputDir);
    (0, utils_1.logInfo)("");
    // 创建浏览器
    (0, utils_1.logInfo)("启动浏览器...");
    const { browser, context } = await createShopBrowser(config);
    const page = await context.newPage();
    await (0, browser_1.injectAntiDetect)(page);
    const allProducts = [];
    let totalCollected = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const startTime = Date.now();
    try {
        // 先访问店铺首页设置 cookie
        (0, utils_1.logInfo)("访问店铺首页...");
        try {
            await page.goto(config.shopUrl, { waitUntil: "networkidle", timeout: 30000 });
            await page.waitForTimeout(3000);
        }
        catch (_b) {
            (0, utils_1.logWarn)("店铺首页加载超时，继续尝试...");
        }
        // 提取商品链接
        (0, utils_1.logInfo)("提取店铺商品链接...");
        const productLinks = await extractShopProductLinks(page, config.shopUrl, config.maxProducts);
        (0, utils_1.logSuccess)("共找到 " + productLinks.length + " 个商品链接");
        // 采集每个商品详情
        for (let i = 0; i < productLinks.length && totalCollected < config.maxProducts; i++) {
            const link = productLinks[i];
            (0, utils_1.logInfo)("");
            (0, utils_1.logInfo)("[" + (i + 1) + "/" + productLinks.length + "] 采集: " + link);
            const product = await scrapeShopProductDetail(page, link, config);
            if (!product) {
                totalSkipped++;
                continue;
            }
            // 保存商品
            try {
                (0, output_1.saveProduct)(config.outputDir, product);
                allProducts.push(product);
                totalCollected++;
                (0, utils_1.logSuccess)("✅ " + product.title + " (¥" + product.price + ")" + (product.sourceSku ? " 货号:" + product.sourceSku : "") + (product.videos && product.videos.length > 0 ? " 🎬" + product.videos.length + "个视频" : ""));
            }
            catch (e) {
                (0, utils_1.logError)("保存失败: " + e.message);
                totalFailed++;
            }
            await (0, browser_1.randomDelay)(3000, 6000);
        }
    }
    catch (e) {
        (0, utils_1.logError)("采集异常: " + e.message);
    }
    finally {
        await browser.close();
    }
    // 输出汇总
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    console.log("\n===========================================");
    (0, utils_1.logSuccess)("店铺采集完成！");
    (0, utils_1.logSuccess)("  采集成功: " + totalCollected);
    (0, utils_1.logSuccess)("  跳过(不足¥" + config.minPrice + "): " + totalSkipped);
    (0, utils_1.logSuccess)("  失败: " + totalFailed);
    (0, utils_1.logSuccess)("  耗时: " + minutes + "分" + seconds + "秒");
    (0, utils_1.logSuccess)("  输出目录: " + config.outputDir);
    // 如果有视频商品，汇总输出
    const videoProducts = allProducts.filter((p) => p.videos && p.videos.length > 0);
    if (videoProducts.length > 0) {
        console.log("");
        (0, utils_1.logInfo)("含视频的商品:");
        videoProducts.forEach((p) => {
            var _a;
            console.log("  - " + p.title + " (" + (((_a = p.videos) === null || _a === void 0 ? void 0 : _a.length) || 0) + "个视频)");
        });
    }
    console.log("===========================================\n");
}
// ─── 启动 ─────────────────────────────────────────────
main().catch((err) => {
    (0, utils_1.logError)("致命错误: " + err.message);
    process.exit(1);
});
