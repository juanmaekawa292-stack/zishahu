/**
 * 1688 紫砂壶商品采集脚本
 * 使用 Chrome Profile 39（已安装 1688 采集插件）
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const DATA_DIR = join(PROJECT_ROOT, "data", "raw_products");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data";
const KEYWORDS = ["紫砂壶", "西施壶", "石瓢壶", "紫泥茶壶", "段泥茶壶", "宜兴紫砂"];
const MIN_PRICE = 100;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeSearch(page, keyword) {
  const url = "https://s.1688.com/selloffer/offer_search.htm?keywords=" + encodeURIComponent(keyword) + "&minPrice=" + MIN_PRICE;
  console.log("[搜索]", keyword);
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await sleep(4000);
  const cu = page.url();
  const t = await page.title();
  console.log("  URL:", cu, "Title:", t);
  if (cu.includes("login") || cu.includes("punish")) return [];
  const items = await page.evaluate(() => {
    const r = [];
    const cards = document.querySelectorAll("[class*=offer], [class*=item], [class*=result]");
    for (let el of cards) {
      const txt = el.innerText?.trim();
      if (txt && (txt.includes("¥") || txt.includes("￥"))) {
        const titleEl = el.querySelector("a[title], [class*=title], h2, h3, [class*=name]");
        const imgEl = el.querySelector("img");
        const linkEl = el.querySelector("a[href*=offer]");
        r.push({ title: titleEl?.textContent?.trim() || "", price: el.querySelector("[class*=price]")?.textContent?.trim() || "", img: imgEl?.src || "", link: linkEl?.href || "", text: txt.substring(0, 100) });
        if (r.length >= 10) return r;
      }
    }
    return r;
  });
  console.log("  =>", items.length, "商品");
  items.slice(0, 3).forEach(i => console.log("    -", i.title?.substring(0, 60)));
  return items;
}

async function main() {
  console.log("=== 1688 紫砂壶商品采集 ===\n最低价格: ¥" + MIN_PRICE);
  console.log("[启动] Chrome Profile 39...");
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: CHROME_PATH, headless: false,
    args: ["--profile-directory=Profile 39", "--disable-blink-features=AutomationControlled", "--window-size=1400,900", "--enable-extensions", "--disable-extensions=false"],
    viewport: { width: 1400, height: 900 }, ignoreDefaultArgs: ["--disable-extensions"], timeout: 45000
  });
  const pg = browser.pages().length > 0 ? browser.pages()[0] : await browser.newPage();
  console.log("浏览器已启动\n");
  const r = await scrapeSearch(pg, KEYWORDS[0]);
  await pg.screenshot({ path: join(DATA_DIR, "_1688_search.png"), fullPage: false });
  if (r.length === 0) {
    console.log("\n⚠️ 需要登录 1688。请在浏览器中登录，登录后按 Ctrl+C 结束脚本，然后运行 node scripts/collector/collect-1688-2.mjs");
  }
  await sleep(5000);
  await browser.close();
  console.log("完成");
}
main().catch(e => { console.error("错误:", e); process.exit(1); });
