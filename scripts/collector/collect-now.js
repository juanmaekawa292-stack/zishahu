const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'data', 'raw_products');
const MIN_PRICE = 150;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Extract JSON from script text using bracket matching
function extractJson(text) {
  const idx = text.indexOf('var b = ');
  if (idx < 0) return null;
  const start = idx + 7;
  if (text[start] !== '{') return null;
  let d = 0, s = false, e = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (e) { e = false; continue; }
    if (ch === '\\' && s) { e = true; continue; }
    if (ch === '"') { s = !s; continue; }
    if (s) continue;
    if (ch === '{') { d++; continue; }
    if (ch !== '}') continue;
    d--;
    if (d === 0) {
      const rest = text.substring(i+1, i+4);
      if (rest === '});' || rest === '};;' || rest[0] === ')' || rest === ';})') {
        return text.substring(start, i+1);
      }
    }
  }
  return null;
}

async function main() {
  console.log('========================================');
  console.log('  古悦堂商品采集器');
  console.log('========================================');
  
  // Connect to CDP Chrome (must be logged in to Taobao/Tmall)
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  
  console.log(`\nChrome 已连接，当前 ${pages.length} 个标签页:`);
  for (const p of pages) {
    console.log(`  ${p.url().substring(0, 100)}`);
  }
  
  // Close any login pages
  for (const p of pages) {
    if (p.url().includes('login') || p.url().includes('chrome-error')) {
      await p.close();
    }
  }
  
  // Find the search page or create one
  const existingPages = ctx.pages();
  let page;
  
  if (existingPages.length > 0) {
    page = existingPages[0];
  } else {
    page = await ctx.newPage();
  }
  
  // Navigate to search page
  console.log('\n导航到古悦堂搜索页...');
  await page.goto('https://guyuetang.tmall.com/search.htm', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);
  
  if (page.url().includes('login')) {
    console.log('❌ 需要登录！请在 Chrome 中打开 https://guyuetang.tmall.com/search.htm');
    console.log('   登录完成后，按 Enter 继续...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    // Try again
    await page.goto('https://guyuetang.tmall.com/search.htm', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);
    
    if (page.url().includes('login')) {
      console.log('❌ 仍然跳转登录页，无法继续');
      await browser.close();
      process.exit(1);
    }
  }
  
  console.log('✅ 搜索页加载成功！\n');
  
  // Get product list
  const products = await page.evaluate(() => {
    const seen = new Set();
    return Array.from(document.querySelectorAll('a[href*="item.htm"]'))
      .filter(a => { const m = a.href.match(/id=(\d+)/); return m && !seen.has(m[1]) ? (seen.add(m[1]), true) : false; })
      .map(a => { const m = a.href.match(/id=(\d+)/); const img = a.querySelector('img'); return { itemId: m[1], title: img?.getAttribute('alt') || '', url: `https://detail.tmall.com/item.htm?id=${m[1]}` }; });
  });
  
  console.log(`找到 ${products.length} 个商品`);
  
  if (products.length === 0) {
    console.log('❌ 未找到商品，可能页面结构变了');
    await browser.close();
    return;
  }
  
  // Collect each product
  const collected = [];
  let skipped = 0, failed = 0;
  
  console.log('\n开始逐个采集商品详情...\n');
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const shortTitle = p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title;
    process.stdout.write(`[${i+1}/${products.length}] ${p.itemId} ${shortTitle} `);
    
    // Navigate within the SAME tab (no new tabs!)
    await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
    
    if (page.url().includes('login')) {
      console.log('❌ 会话过期');
      failed++;
      // Can't continue
      break;
    }
    
    // Get raw script text
    const rawText = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script')) {
        const t = s.textContent || '';
        if (t.includes('__ICE_APP_CONTEXT__')) return t;
      }
      return null;
    });
    
    if (!rawText) {
      console.log('❌ 无数据');
      failed++;
      continue;
    }
    
    const jsonStr = extractJson(rawText);
    if (!jsonStr) {
      console.log('❌ JSON提取失败');
      failed++;
      continue;
    }
    
    let parsed;
    try { parsed = JSON.parse(jsonStr); }
    catch (e) { console.log('❌ JSON解析错误'); failed++; continue; }
    
    const res = parsed?.loaderData?.home?.data?.res;
    if (!res) { console.log('❌ 无商品数据'); failed++; continue; }
    
    const item = res.item || {};
    const sku2info = res.skuCore?.sku2info || {};
    const industry = res.plusViewVO?.industryParamVO || {};
    
    // Price
    let lowest = 999999;
    for (const [, v] of Object.entries(sku2info)) {
      const pr = parseFloat(v?.price?.priceMoney || '0') / 100;
      if (pr > 0 && pr < lowest) lowest = pr;
    }
    if (lowest === 999999) lowest = 0;
    
    if (lowest < MIN_PRICE) {
      console.log(`⏭️ ¥${lowest} (<¥${MIN_PRICE})`);
      skipped++;
      continue;
    }
    
    // Build data
    const attrs = {};
    for (const p of (industry?.basicParamList || [])) attrs[p.propertyName] = p.valueName;
    for (const p of (industry?.enhanceParamList || [])) attrs[p.propertyName] = p.valueName;
    
    const data = {
      itemId: item.itemId || p.itemId,
      title: item.title || p.title,
      price: lowest,
      vagueSellCount: item.vagueSellCount || '',
      images: (item.images || []).map(i => i.startsWith('//') ? 'https:' + i : i),
      videos: (item.videos || []).map(v => ({
        videoId: v.videoId, url: v.url || '', thumbnail: v.videoThumbnailURL || ''
      })),
      attributes: attrs,
      skuOptions: (res.skuCore?.skuBase?.props || []).map(p2 => ({
        name: p2.name,
        values: (p2.values || []).map(v => ({ name: v.name, image: v.image }))
      })),
      descUrl: item.pcADescUrl || '',
      sourceUrl: page.url(),
      shopName: res.seller?.shopName || ''
    };
    
    collected.push(data);
    console.log(`✅ ¥${lowest} 图${data.images.length} 频${data.videos.length}`);
    
    // Brief delay between products
    await sleep(500);
  }
  
  // Save
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const file = path.join(OUTPUT_DIR, `guyuetang-${ts}.json`);
  
  fs.writeFileSync(file, JSON.stringify({
    shop: '古悦堂旗舰店',
    shopUrl: 'https://guyuetang.tmall.com',
    collectedAt: new Date().toISOString(),
    total: products.length, collected: collected.length, skipped, failed,
    minPrice: MIN_PRICE, products: collected
  }, null, 2), 'utf-8');
  
  console.log(`\n========================================`);
  console.log(`  采集完成`);
  console.log(`  总商品: ${products.length}`);
  console.log(`  成功: ${collected.length}`);
  console.log(`  跳过(<¥${MIN_PRICE}): ${skipped}`);
  console.log(`  失败: ${failed}`);
  console.log(`  输出: ${file}`);
  console.log(`========================================`);
  
  await browser.close();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
