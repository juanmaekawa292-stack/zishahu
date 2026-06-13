"use strict";
/**
 * tmall product collector entry point
 *
 * Usage:
 *   npx tsx scripts/collector/index.ts                    # default config
 *   npx tsx scripts/collector/index.ts --headless         # headless mode
 *   npx tsx scripts/collector/index.ts --max 50           # max 50 products
 *   npx tsx scripts/collector/index.ts --keyword manual-zisha  # custom keyword
 *   npx tsx scripts/collector/index.ts --incremental      # incremental mode
 *   npx tsx scripts/collector/index.ts --detail 123456    # single product detail
 *   npx tsx scripts/collector/index.ts --export-csv       # export as CSV
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("./browser");
const tmall_scraper_1 = require("./tmall-scraper");
const utils_1 = require("./utils");
const output_1 = require("./output");
const path_1 = __importDefault(require("path"));
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {};
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--headless":
                opts.headless = true;
                break;
            case "--max":
                opts.maxProducts = parseInt(args[++i], 10) || 20;
                break;
            case "--keyword":
                opts.keywords = [args[++i]];
                break;
            case "--keywords":
                opts.keywords = args[++i].split(",");
                break;
            case "--proxy":
                opts.proxy = args[++i];
                break;
            case "--detail":
                opts.detailId = args[++i];
                break;
            case "--incremental":
                opts.incremental = true;
                break;
            case "--export-csv":
                opts.exportCsv = true;
                break;
            case "--output":
                opts.outputDir = args[++i];
                break;
            case "--login":
                opts.login = true;
                break;
        }
    }
    return opts;
}
async function runBatchCollect(config, incremental) {
    const startTime = Date.now();
    const result = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        duration: 0,
    };
    const collectedIds = incremental
        ? (0, output_1.loadCollectedIds)(config.outputDir)
        : new Set();
    (0, utils_1.logInfo)("launching browser...");
    const { browser, context } = await (0, browser_1.createBrowser)(config);
    const page = await context.newPage();
    await (0, browser_1.injectAntiDetect)(page);
    try {
        for (const keyword of config.keywords) {
            if (result.success >= config.maxProducts)
                break;
            const links = await (0, tmall_scraper_1.searchProducts)(page, keyword, config.maxProducts - result.success, config);
            (0, utils_1.logInfo)("keyword \"" + keyword + "\" found " + links.length + " product links");
            for (const link of links) {
                if (result.success >= config.maxProducts)
                    break;
                const m = link.match(/id=(\d+)/);
                const tmallId = m ? m[1] : null;
                if (!tmallId)
                    continue;
                if (incremental && collectedIds.has(tmallId)) {
                    (0, utils_1.logInfo)("  skip already collected: " + tmallId);
                    result.skipped++;
                    continue;
                }
                const product = await (0, tmall_scraper_1.scrapeProductDetail)(page, link, config);
                if (!product) {
                    result.failed++;
                    result.errors.push({ tmallId, message: "scrape failed" });
                    continue;
                }
                if (await (0, tmall_scraper_1.isCaptchaTriggered)(page)) {
                    (0, utils_1.logWarn)("captcha detected! complete it in browser then press Enter...");
                    (0, utils_1.logInfo)("you can manually open " + link + " to complete verification");
                    await new Promise((resolve) => {
                        process.stdin.once("data", function () {
                            resolve();
                        });
                    });
                }
                const detailImages = await (0, tmall_scraper_1.scrapeDetailImages)(page, config);
                product.detailImages = detailImages;
                (0, utils_1.logInfo)("  detail images: " + detailImages.length);
                (0, output_1.saveProduct)(config.outputDir, product);
                collectedIds.add(tmallId);
                result.success++;
                (0, utils_1.logSuccess)("[" + result.success + "/" + config.maxProducts + "] " + product.title);
                await (0, browser_1.randomDelay)(config.minDelay, config.maxDelay);
            }
        }
    }
    catch (err) {
        (0, utils_1.logError)("collect exception: " + err.message);
    }
    finally {
        await browser.close();
    }
    result.duration = Date.now() - startTime;
    return result;
}
async function runSingleCollect(config, tmallId) {
    const productUrl = "https://detail.tmall.com/item.htm?id=" + tmallId;
    (0, utils_1.logInfo)("collecting single product: " + productUrl);
    const { browser, context } = await (0, browser_1.createBrowser)(config);
    const page = await context.newPage();
    await (0, browser_1.injectAntiDetect)(page);
    try {
        const product = await (0, tmall_scraper_1.scrapeProductDetail)(page, productUrl, config);
        if (product) {
            const detailImages = await (0, tmall_scraper_1.scrapeDetailImages)(page, config);
            product.detailImages = detailImages;
            (0, output_1.saveProduct)(config.outputDir, product);
            (0, utils_1.logSuccess)("product saved: " + product.title);
            console.log(JSON.stringify(product, null, 2));
        }
        else {
            (0, utils_1.logError)("scrape failed");
        }
    }
    catch (err) {
        (0, utils_1.logError)("collect exception: " + err.message);
    }
    finally {
        await browser.close();
    }
}
function printResult(result) {
    console.log("\n===========================================");
    console.log("  collect complete");
    console.log("  success: " + result.success);
    console.log("  failed: " + result.failed);
    console.log("  skipped: " + result.skipped);
    console.log("  duration: " + (0, utils_1.formatDuration)(result.duration));
    if (result.errors.length > 0) {
        console.log("  errors:");
        result.errors.forEach(function (e) {
            console.log("    - " + e.tmallId + ": " + e.message);
        });
    }
    console.log("===========================================\n");
}
async function main() {
    var _a;
    const opts = parseArgs();
    const config = Object.assign(Object.assign({}, utils_1.DEFAULT_CONFIG), opts);
    (0, utils_1.ensureDir)(config.outputDir);
    // Login mode
    if (opts.login) {
        (0, utils_1.logInfo)("Login mode: please run the dedicated login helper instead");
        (0, utils_1.logInfo)("  npx tsx scripts/collector/login-helper.ts");
        return;
    }
    if (opts.exportCsv) {
        const csvPath = path_1.default.join(config.outputDir, "products_export.csv");
        (0, output_1.exportAsCSV)(config.outputDir, csvPath);
        return;
    }
    if (opts.detailId) {
        await runSingleCollect(config, opts.detailId);
        return;
    }
    (0, utils_1.logInfo)("collect config:");
    (0, utils_1.logInfo)("  keywords: " + config.keywords.join(", "));
    (0, utils_1.logInfo)("  max products: " + config.maxProducts);
    (0, utils_1.logInfo)("  headless: " + (config.headless ? "yes" : "no"));
    (0, utils_1.logInfo)("  output dir: " + config.outputDir);
    (0, utils_1.logInfo)("  incremental: " + (opts.incremental ? "yes" : "no"));
    const result = await runBatchCollect(config, (_a = opts.incremental) !== null && _a !== void 0 ? _a : false);
    printResult(result);
    const csvPath = path_1.default.join(config.outputDir, "products_export.csv");
    (0, output_1.exportAsCSV)(config.outputDir, csvPath);
}
main().catch(function (err) {
    (0, utils_1.logError)("fatal: " + err.message);
    process.exit(1);
});
