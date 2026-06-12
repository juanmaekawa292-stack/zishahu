import { Page } from "playwright";
import { TmallRawProduct, CollectorConfig, SkuItem, DetailImage } from "./types";
import { randomDelay } from "./browser";
import { extractTmallId, logInfo, logSuccess, logWarn, logError } from "./utils";

// ─── 搜索页 ───────────────────────────────────────────────

/** 在天猫搜索关键词，返回搜索结果页上的商品链接列表 */
export async function searchProducts(
  page: Page,
  keyword: string,
  maxResults: number,
  config: CollectorConfig
): Promise<string[]> {
  const searchUrl = `https://list.tmall.com/search_product.htm?q=${encodeURIComponent(keyword)}`;
  logInfo(`搜索: ${keyword}`);
  await page.goto(searchUrl, { waitUntil: "networkidle", timeout: config.timeout });
  await randomDelay(3000, 5000);

  const productLinks: string[] = [];
  let pageIndex = 0;

  while (productLinks.length < maxResults) {
    // 提取当前页商品链接
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="detail.tmall.com"], a[href*="detail.tmall.hk"], .productImg-wrap a, .item a[href*="item.htm"]'
      );
      return Array.from(anchors)
        .map((a) => a.href)
        .filter((href) => href.includes("item.htm") || href.includes("detail"))
        .filter((v, i, a) => a.indexOf(v) === i);
    });

    for (const link of links) {
      if (productLinks.length >= maxResults) break;
      const tmallId = extractTmallId(link);
      if (tmallId && !productLinks.some((l) => l.includes(tmallId!))) {
        productLinks.push(link);
      }
    }

    logInfo(`  第 ${pageIndex + 1} 页: 找到 ${productLinks.length} 个商品`);
    if (productLinks.length >= maxResults) break;

    // 翻页
    const nextBtn = page.locator(".ui-page-next, .next, a.next, .page-next, [class*='next']").first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForLoadState("networkidle", { timeout: config.timeout });
      await randomDelay(config.minDelay, config.maxDelay);
      pageIndex++;
    } else {
      logInfo("  没有更多页了");
      break;
    }
  }

  return productLinks.slice(0, maxResults);
}

// ─── 详情页 ───────────────────────────────────────────────

/**
 * 采集单个天猫商品详情
 * 使用多策略选择器以应对天猫 DOM 变化
 */
export async function scrapeProductDetail(
  page: Page,
  productUrl: string,
  config: CollectorConfig
): Promise<TmallRawProduct | null> {
  const tmallId = extractTmallId(productUrl);
  if (!tmallId) {
    logWarn(`无法提取商品 ID: ${productUrl}`);
    return null;
  }

  logInfo(`采集商品: ${productUrl}`);

  try {
    await page.goto(productUrl, { waitUntil: "networkidle", timeout: config.timeout });
    await randomDelay(3000, 6000);
    // 额外等待关键元素加载
    await page.waitForTimeout(2000);
    await randomDelay(1000, 3000);
  } catch (err: any) {
    logError(`加载详情页失败: ${productUrl} - ${err.message}`);
    return null;
  }

  try {
    const title = await extractTitle(page);
    const price = await extractPrice(page);
    const originalPrice = await extractOriginalPrice(page);
    const mainImages = await extractMainImages(page);
    const reviewCount = await extractReviewCount(page);
    const salesCount = await extractSalesCount(page);
    const shopName = await extractShopName(page);
    const skus = await extractSkus(page);

    return {
      tmallId,
      collectedAt: new Date().toISOString(),
      title,
      price,
      originalPrice,
      mainImages,
      detailImages: [], // 详情图需要额外加载
      skus,
      reviewCount,
      salesCount,
      shopName,
      productUrl,
    };
  } catch (err: any) {
    logError(`采集商品详情失败: ${tmallId} - ${err.message}`);
    return null;
  }
}

// ─── 字段提取函数（多选择器回退） ──────────────────────

/** 提取标题 */
async function extractTitle(page: Page): Promise<string> {
  const selectors = [
    ".tb-detail-hd h1",
    ".detail-title h1",
    "h1.tb-main-title",
    ".main-title",
    "[data-spm='title']",
    'h1[class*="title"]',
    ".product-title h1",
    // 兜底：取页面 title
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent())?.trim();
      if (text && text.length > 5) return text;
    }
  }
  const fallback = await page.title();
  return fallback.replace(/-.*$/, "").trim();
}

/** 提取价格 */
async function extractPrice(page: Page): Promise<number> {
  const selectors = [
    ".tm-price",
    ".tm-promo-price .tm-price",
    ".detail-price .price",
    "[class*='price'] .price-num",
    ".actual-price",
    ".tb-rmb-num",
    '[data-spm="price"] .tm-price',
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent())?.trim();
      const num = parseFloat(text?.replace(/[^0-9.]/g, "") ?? "");
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return 0;
}

/** 提取原价 */
async function extractOriginalPrice(page: Page): Promise<number | undefined> {
  const selectors = [
    ".tm-original-price .tm-price",
    ".original-price .price",
    ".detail-original-price",
    '[class*="original"] [class*="price"]',
    ".tb-price-original .tb-rmb-num",
    ".market-price .tm-price",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent())?.trim();
      const num = parseFloat(text?.replace(/[^0-9.]/g, "") ?? "");
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return undefined;
}

/** 提取主图列表 */
async function extractMainImages(page: Page): Promise<string[]> {
  const selectors = [
    "#J_UlThumb img, .tb-thumb img",
    ".detail-gallery img",
    ".tb-gallery img",
    '[data-spm="gallery"] img',
    ".item-gallery img",
    ".main-img img",
  ];
  const imageSet = new Set<string>();

  for (const sel of selectors) {
    const imgs = page.locator(sel);
    const count = await imgs.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const src = await imgs.nth(i).getAttribute("src").catch(() => null);
      const dataSrc = await imgs.nth(i).getAttribute("data-src").catch(() => null);
      const url = (dataSrc || src || "").trim();
      // 转 https 并过滤缩略图
      if (url && !imageSet.has(url)) {
        const fullUrl = url.startsWith("//") ? "https:" + url : url;
        if (fullUrl.length > 30 && !fullUrl.includes(".gif")) {
          imageSet.add(fullUrl);
        }
      }
    }
    if (imageSet.size > 0) break;
  }

  // 如果没找到，从页面 DOM 中查找所有大图
  if (imageSet.size === 0) {
    const urls = await page.evaluate(() => {
      const imgs = document.querySelectorAll<HTMLImageElement>("img");
      return Array.from(imgs)
        .map((img) => img.getAttribute("data-src") || img.src || "")
        .filter((src) => src.includes("alicdn") || src.includes("taobao") || src.includes("tmall"))
        .filter((src) => src.length > 40)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
    });
    urls.forEach((u) => imageSet.add(u.startsWith("//") ? "https:" + u : u));
  }

  return Array.from(imageSet);
}

/** 提取评价数 */
async function extractReviewCount(page: Page): Promise<number> {
  const selectors = [
    "#J_Reviews .count, .tb-rate-count",
    '[class*="review"] [class*="count"]',
    ".review-count",
    "[data-spm='reviews'] .count",
    ".tm-count",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent())?.trim();
      const num = parseInt(text?.replace(/[^0-9]/g, "") ?? "", 10);
      if (!isNaN(num)) return num;
    }
  }
  return 0;
}

/** 提取销量 */
async function extractSalesCount(page: Page): Promise<number | undefined> {
  const selectors = [
    ".tb-sell-counter .tm-count",
    '[class*="sales"] [class*="count"]',
    ".sales-count",
    ".sell-count",
    "[data-spm='sales'] .count",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent())?.trim();
      const num = parseInt(text?.replace(/[^0-9]/g, "") ?? "", 10);
      if (!isNaN(num)) return num;
    }
  }
  return undefined;
}

/** 提取店铺名称 */
async function extractShopName(page: Page): Promise<string | undefined> {
  const selectors = [
    ".tb-shop-name a, .shop-name a",
    ".detail-shop-name a",
    '[class*="shop"] [class*="name"] a',
    ".J_TShopName a",
    ".shop-title a",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent())?.trim();
      if (text && text.length > 1) return text;
    }
  }
  return undefined;
}

/** 提取 SKU（规格选项） */
async function extractSkus(page: Page): Promise<SkuItem[]> {
  const skus: SkuItem[] = [];

  try {
    // 尝试从页面数据中读取 SKU
    const raw = await page.evaluate(() => {
      // 天猫常用 SKU 数据挂在 window 上
      const win = window as any;
      return win?.valItemList ?? win?.skuMap ?? win?.skuList ?? null;
    });

    if (raw && typeof raw === "object") {
      // 处理不同格式
      if (Array.isArray(raw)) {
        for (const item of raw) {
          skus.push({
            id: String(item.skuId ?? item.id ?? ""),
            specs: [],
            price: parseFloat(item.price ?? item.skuPrice ?? "0"),
            originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
            stock: parseInt(item.stock ?? item.quantity ?? "0", 10),
            image: item.image ?? undefined,
          });
        }
      }
    }
  } catch {
    // 静默失败
  }

  if (skus.length > 0) return skus;

  // 从 DOM 提取规格项
  try {
    const skuProps = await page.evaluate(() => {
      const props: { name: string; values: { title: string; image?: string }[] }[] = [];
      const propItems = document.querySelectorAll(
        ".sku-area .sku-prop, .J_TSaleProp, [data-spm='sku'] .sku-prop"
      );
      propItems.forEach((prop) => {
        const name = prop.querySelector(".sku-prop-title, .prop-title, .sku-prop-header")?.textContent?.trim() ?? "";
        const values: { title: string; image?: string }[] = [];
        prop.querySelectorAll<HTMLElement>(".sku-prop-item, .prop-item, li").forEach((item) => {
          const title = item.textContent?.trim() ?? "";
          const img = item.querySelector("img")?.src ?? undefined;
          if (title) values.push({ title, image: img });
        });
        if (name) props.push({ name, values });
      });
      return props;
    });

    if (skuProps.length > 0) {
      // 简化为一个虚拟 SKU，包含规格描述
      const specsText = skuProps
        .map((p) => p.name + ": " + p.values.map((v) => v.title).join(", "))
        .join("; ");
      skus.push({
        id: "default",
        specs: [{ label: "规格", value: specsText }],
        price: 0,
        stock: 0,
      });
    }
  } catch {
    // 静默失败
  }

  return skus;
}

// ─── 详情描述图（需要额外加载描述区） ─────────────────────

/**
 * 加载商品详情描述区（天猫详情描述通常在 iframe 或延迟加载的 div 中）
 */
export async function scrapeDetailImages(
  page: Page,
  config: CollectorConfig
): Promise<DetailImage[]> {
  const images: DetailImage[] = [];

  try {
    // 天猫商品描述区域
    const descSelectors = [
      "#description iframe",
      ".tb-detail-description iframe",
      '[data-spm="description"] iframe',
      ".detail-description iframe",
    ];

    let descFrame: import("playwright").Frame | null = null;
    for (const sel of descSelectors) {
      const frameEl = page.locator(sel).first();
      if (await frameEl.count().catch(() => 0) > 0) {
        const allFrames = page.frames();
        descFrame = allFrames.find((f) =>
          f.url().includes("description") || f.url().includes("desc")
        ) || allFrames.find((f) => f.url() !== page.url()) || null;
        if (descFrame) break;
      }
    }

    if (descFrame) {
      try {
        await descFrame.waitForSelector("img", { state: "visible", timeout: 15000 });
      } catch {}
      await randomDelay(2000, 4000);

      const imgs = await descFrame.evaluate(() => {
        return Array.from(document.querySelectorAll<HTMLImageElement>("img")).map((img, i) => ({
          url: img.getAttribute("data-src") || img.getAttribute("src") || "",
          alt: img.alt || "",
          index: i,
        }));
      });
      images.push(...imgs.filter((img) => img.url));
    }

    // 如果没有 iframe，尝试直接在页面中找详情图
    if (images.length === 0) {
      const imgs = await page.evaluate(() => {
        const descAreas = document.querySelectorAll(
          "#description img, .detail-desc img, [class*='desc'] img, [class*='detail'] img"
        );
        return Array.from(descAreas)
          .map((img, i) => ({
            url: (img as HTMLImageElement).getAttribute("data-src") || (img as HTMLImageElement).src || "",
            alt: (img as HTMLImageElement).alt || `详情图 ${i + 1}`,
            index: i,
          }))
          .filter((img) => img.url && img.url.length > 30);
      });
      images.push(...imgs);
    }
  } catch (err: any) {
    logWarn(`加载详情图失败: ${err.message}`);
  }

  return images;
}

// ─── 防检测：人类行为模拟 ──────────────────────────────

/** 模拟人类滚动行为 */
export async function simulateHumanScroll(page: Page) {
  await page.evaluate(async () => {
    const distance = 400 + Math.random() * 600;
    const totalHeight = document.body.scrollHeight;
    const steps = Math.ceil(totalHeight / distance);

    for (let i = 0; i < steps; i++) {
      window.scrollBy(0, distance);
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
    }

    // 滚动回顶部
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
  });
}

/** 检查是否触发反爬（滑块/验证码） */
export async function isCaptchaTriggered(page: Page): Promise<boolean> {
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  const captchaKeywords = [
    "验证", "滑块", "请完成安全验证", "captcha", "安全验证",
    "请按住滑块", "拖动", "verify", "robot", "请点击",
  ];
  return captchaKeywords.some((kw) => bodyText.includes(kw));
}

