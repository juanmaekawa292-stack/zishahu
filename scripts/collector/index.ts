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

import { createBrowser, injectAntiDetect, randomDelay } from "./browser";
import {
  searchProducts,
  scrapeProductDetail,
  isCaptchaTriggered,
  simulateHumanScroll,
  scrapeDetailImages,
} from "./tmall-scraper";
import {
  DEFAULT_CONFIG,
  formatDuration,
  logInfo,
  logSuccess,
  logWarn,
  logError,
  ensureDir,
} from "./utils";
import {
  saveProduct,
  exportAsCSV,
  exportAllAsArray,
  saveProducts,
  loadCollectedIds,
} from "./output";
import { CollectorConfig, CollectResult, TmallRawProduct } from "./types";
import path from "path";

function parseArgs(): Partial<CollectorConfig> & {
  detailId?: string;
  incremental?: boolean;
  exportCsv?: boolean;
  login?: boolean;
} {
  const args = process.argv.slice(2);
  const opts: any = {};
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

async function runBatchCollect(
  config: CollectorConfig,
  incremental: boolean
): Promise<CollectResult> {
  const startTime = Date.now();
  const result: CollectResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    duration: 0,
  };
  const collectedIds = incremental
    ? loadCollectedIds(config.outputDir)
    : new Set<string>();

  logInfo("launching browser...");
  const { browser, context } = await createBrowser(config);
  const page = await context.newPage();
  await injectAntiDetect(page);

  try {
    for (const keyword of config.keywords) {
      if (result.success >= config.maxProducts) break;
      const links = await searchProducts(
        page,
        keyword,
        config.maxProducts - result.success,
        config
      );
      logInfo(
        "keyword \"" + keyword + "\" found " + links.length + " product links"
      );

      for (const link of links) {
        if (result.success >= config.maxProducts) break;
        const m = link.match(/id=(\d+)/);
        const tmallId = m ? m[1] : null;
        if (!tmallId) continue;

        if (incremental && collectedIds.has(tmallId)) {
          logInfo("  skip already collected: " + tmallId);
          result.skipped++;
          continue;
        }

        const product = await scrapeProductDetail(page, link, config);
        if (!product) {
          result.failed++;
          result.errors.push({ tmallId, message: "scrape failed" });
          continue;
        }

        if (await isCaptchaTriggered(page)) {
          logWarn(
            "captcha detected! complete it in browser then press Enter..."
          );
          logInfo("you can manually open " + link + " to complete verification");
          await new Promise<void>((resolve) => {
            process.stdin.once("data", function () {
              resolve();
            });
          });
        }

        const detailImages = await scrapeDetailImages(page, config);
        product.detailImages = detailImages;
        logInfo("  detail images: " + detailImages.length);

        saveProduct(config.outputDir, product);
        collectedIds.add(tmallId);
        result.success++;

        logSuccess(
          "[" + result.success + "/" + config.maxProducts + "] " + product.title
        );

        await randomDelay(config.minDelay, config.maxDelay);
      }
    }
  } catch (err: any) {
    logError("collect exception: " + err.message);
  } finally {
    await browser.close();
  }

  result.duration = Date.now() - startTime;
  return result;
}

async function runSingleCollect(config: CollectorConfig, tmallId: string) {
  const productUrl = "https://detail.tmall.com/item.htm?id=" + tmallId;
  logInfo("collecting single product: " + productUrl);

  const { browser, context } = await createBrowser(config);
  const page = await context.newPage();
  await injectAntiDetect(page);

  try {
    const product = await scrapeProductDetail(page, productUrl, config);
    if (product) {
      const detailImages = await scrapeDetailImages(page, config);
      product.detailImages = detailImages;
      saveProduct(config.outputDir, product);
      logSuccess("product saved: " + product.title);
      console.log(JSON.stringify(product, null, 2));
    } else {
      logError("scrape failed");
    }
  } catch (err: any) {
    logError("collect exception: " + err.message);
  } finally {
    await browser.close();
  }
}

function printResult(result: CollectResult) {
  console.log("\n===========================================");
  console.log("  collect complete");
  console.log("  success: " + result.success);
  console.log("  failed: " + result.failed);
  console.log("  skipped: " + result.skipped);
  console.log("  duration: " + formatDuration(result.duration));
  if (result.errors.length > 0) {
    console.log("  errors:");
    result.errors.forEach(function (e) {
      console.log("    - " + e.tmallId + ": " + e.message);
    });
  }
  console.log("===========================================\n");
}

async function main() {
  const opts = parseArgs();
  const config: CollectorConfig = { ...DEFAULT_CONFIG, ...opts };
   ensureDir(config.outputDir);

  // Login mode
  if (opts.login) {
    logInfo("Login mode: please run the dedicated login helper instead");
    logInfo("  npx tsx scripts/collector/login-helper.ts");
    return;
  }

  if (opts.exportCsv) {
    const csvPath = path.join(config.outputDir, "products_export.csv");
    exportAsCSV(config.outputDir, csvPath);
    return;
  }

  if (opts.detailId) {
    await runSingleCollect(config, opts.detailId);
    return;
  }

  logInfo("collect config:");
  logInfo("  keywords: " + config.keywords.join(", "));
  logInfo("  max products: " + config.maxProducts);
  logInfo(
    "  headless: " + (config.headless ? "yes" : "no")
  );
  logInfo("  output dir: " + config.outputDir);
  logInfo("  incremental: " + (opts.incremental ? "yes" : "no"));

  const result = await runBatchCollect(config, opts.incremental ?? false);
  printResult(result);

  const csvPath = path.join(config.outputDir, "products_export.csv");
  exportAsCSV(config.outputDir, csvPath);
}

main().catch(function (err: any) {
  logError("fatal: " + err.message);
  process.exit(1);
});
