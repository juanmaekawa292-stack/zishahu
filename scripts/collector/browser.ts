import { Browser, BrowserContext, chromium } from "playwright";
import { CollectorConfig } from "./types";
import * as fs from "fs";
import * as path from "path";

/** 随机 User-Agent 池 */
const UA_LIST = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function randomUA(): string {
  return UA_LIST[Math.floor(Math.random() * UA_LIST.length)];
}

function randomViewport() {
  const widths = [1366, 1440, 1536, 1680, 1920];
  const heights = [768, 900, 864, 1050, 1080];
  return {
    width: widths[Math.floor(Math.random() * widths.length)],
    height: heights[Math.floor(Math.random() * heights.length)],
  };
}

/** 创建并启动浏览器实例，带反检测配置 */
export async function createBrowser(config: CollectorConfig): Promise<{
  browser: Browser;
  context: BrowserContext;
}> {
  const viewport = randomViewport();
  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: config.headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      '--disable-features=IsolateOrigins,site-per-process',
      "--window-size=" + viewport.width + "," + viewport.height,
    ],
  };

  if (config.proxy) {
    launchOptions.proxy = { server: config.proxy };
  }

  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    userAgent: randomUA(),
    viewport,
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    geolocation: { latitude: 31.2304, longitude: 121.4737 },
    permissions: ["geolocation"],
    deviceScaleFactor: 2,
    extraHTTPHeaders: {
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
    },
  });

  return { browser, context };
}

/** 从已保存的文件加载 Cookie（如果存在） */
export function resolveCookiePath(config: CollectorConfig): string | null {
  // Try explicit cookie path first, then default paths
  const candidates = [
    config.outputDir
      ? path.join(config.outputDir, ".taobao_cookies_state.json")
      : null,
    path.resolve("data", "raw_products", ".taobao_cookies_state.json"),
    path.resolve("data", "raw_products", ".taobao_cookies.json"),
  ].filter(Boolean) as string[];

  for (const cp of candidates) {
    if (fs.existsSync(cp)) {
      return cp;
    }
  }
  return null;
}

/** 创建浏览器上下文，自动加载已保存的 Cookie */
export async function createContextWithCookies(
  browser: Browser,
  config: CollectorConfig
): Promise<BrowserContext> {
  const cookiePath = resolveCookiePath(config);

  if (cookiePath && cookiePath.endsWith("_state.json")) {
    // Use Playwright's storageState for full session restore
    const state = JSON.parse(fs.readFileSync(cookiePath, "utf-8"));
    const context = await browser.newContext({
      storageState: cookiePath,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
      locale: "zh-CN",
      timezoneId: "Asia/Shanghai",
      geolocation: { latitude: 31.2304, longitude: 121.4737 },
      permissions: ["geolocation"],
      deviceScaleFactor: 2,
    });
    return context;
  }

  if (cookiePath && cookiePath.endsWith(".json")) {
    const cookies = JSON.parse(fs.readFileSync(cookiePath, "utf-8"));
    const context = await browser.newContext({
      userAgent: randomUA(),
      viewport: randomViewport(),
      locale: "zh-CN",
      timezoneId: "Asia/Shanghai",
      geolocation: { latitude: 31.2304, longitude: 121.4737 },
      permissions: ["geolocation"],
    });
    await context.addCookies(cookies);
    return context;
  }

  // No cookies found, create normal context
  const context = await browser.newContext({
    userAgent: randomUA(),
    viewport: randomViewport(),
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    geolocation: { latitude: 31.2304, longitude: 121.4737 },
    permissions: ["geolocation"],
    deviceScaleFactor: 2,
    extraHTTPHeaders: {
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
  });
  return context;
 }

/** 在页面加载前注入反检测脚本 */
export async function injectAntiDetect(page: import("playwright").Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5] as unknown as PluginArray,
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["zh-CN", "zh", "en"],
    });
    // 覆盖 chrome 对象
    (window as any).chrome = {
      runtime: {},
      loadTimes: function () {},
      csi: function () {},
      app: {},
    };
  });
}

/** 随机等待一段时间，模拟人类行为 */
export async function randomDelay(min: number, max: number) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((r) => setTimeout(r, ms));
}

export { randomUA, randomViewport };
