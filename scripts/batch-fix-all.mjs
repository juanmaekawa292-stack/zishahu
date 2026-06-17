
/**
 * batch-fix-all.mjs - Complete data fix pipeline
 * Scans all 0615 + 616 product folders, reads xlsx data + local image files,
 * generates complete products.ts, uploads images to COS.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Config ──────────────────────────────────────────────
const PRODUCTS_TS = path.join(ROOT, 'src', 'data', 'products.ts');
const COS_BASE = 'https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com';
const TUKUAI_0615 = 'D:\x1b7\x56fe\x5feb\x4e0b\x8f7d\x5668\x635e\x5b9d\x91c7\x96c6\x0615';
const TUKUAI_616 = 'D:\x1b7\x56fe\x5feb\x4e0b\x8f7d\x5668\x635e\x5b9d\x91c7\x96c6\x616';
const PRICE_COEFFICIENT = 10;
const EXCHANGE_RATE = 7.25;
const PRICE_MIN_RMB = 150;
const CATEGORY_ALIASES = {
  '\x1c1': 'teapot', '\x1cb6\x1c1': 'teapot', '\x7d2b\x7802\x1c1': 'teapot',
  '\x676f': 'cup', '\x8336\x676f': 'cup',
  '\x8336\x5ba0': 'teaPet', '\x8336\x5177\x914d\x4ef6': 'teaTool', '\x5de5\x5177': 'teaTool',
  '\x5957\x88c5': 'gift', '\x793c\x76d2': 'gift', '\x793c\x54c1': 'gift',
};

function detectCategory(title) {
  for (const [kw, cat] of Object.entries(CATEGORY_ALIASES)) {
    if (title.includes(kw)) return cat;
  }
  return 'teapot';
}

function extractIdFromUrl(url) {
  const m = url.match(/[?&]id=(d+)/);
  return m ? m[1] : '';
}

function calculatePrice(rmbPrice) {
  if (!rmbPrice || rmbPrice < PRICE_MIN_RMB) return null;
  const rawUSD = (rmbPrice * PRICE_COEFFICIENT) / EXCHANGE_RATE;
  let finalPrice = Math.round(rawUSD);
  finalPrice = Math.floor(finalPrice / 10) * 10 + 9;
  if (finalPrice < 19) finalPrice = 19;
  const suggestedOriginal = Math.round(finalPrice * 1.3);
  return {
    price: finalPrice,
    originalPrice: suggestedOriginal > finalPrice ? suggestedOriginal : undefined,
  };
}

// Scan all product folders and return structured data
async function scanAllFolders() {
  const batches = [];
  for (const baseDir of [TUKUAI_0615, TUKUAI_616]) {
    if (!fs.existsSync(baseDir)) continue;
    const folders = fs.readdirSync(baseDir)
      .filter(f => /^[0-7]/.test(f));
    batches.push({ baseDir, folders });
  }
  
  const X = await import('xlsx');
  const allProducts = [];
  
  for (const batch of batches) {
    for (const folder of batch.folders) {
      const folderPath = path.join(batch.baseDir, folder);
      const xlsxFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.xlsx'));
      if (xlsxFiles.length === 0) continue;
      
      const wb = X.readFile(path.join(folderPath, xlsxFiles[0]));
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = X.utils.sheet_to_json(ws, { header: 1 });
      
      const productUrl = data[1] ? String(data[1][11] || '') : '';
      const itemId = extractIdFromUrl(productUrl);
      const productName = data[1] ? String(data[1][12] || '') : folder.replace(/^d+_/, '');
      
      const files = fs.readdirSync(folderPath);
      
      allProducts.push({
        folder: folder.substring(0, 40),
        folderPath,
        productUrl,
        itemId,
        productName,
        xlsxRows: data.length,
        files,
      });
    }
  }
  
  return allProducts;
}

async function main() {
  console.log('=== Batch Fix All Products ===n');
  
  // Scan
  console.log('Step 1: Scanning folders...');
  const results = await scanAllFolders();
  console.log('  Total products:', results.length);
  
  // Read existing products to understand mapping
  const content = fs.readFileSync(PRODUCTS_TS, 'utf-8');
  const existingIds = [...content.matchAll(/id: "(tk-d+)"/g)].map(m => m[1]);
  const existingUrls = [...content.matchAll(/sourceUrl: "([^"]+)"/g)].map(m => m[1]);
  
  console.log('  Existing IDs:', existingIds.length);
  
  // Write tracking
  const tracking = [
    '# Data Fix Tracking',
    'Date: ' + new Date().toISOString(),
    '',
    '## Summary',
    '- Existing products: ' + existingIds.length,
    '- Total scan results: ' + results.length,
    '',
    '## Sample products',
    ...results.slice(0, 20).map((p, i) => 
      '- ' + (i+1) + '. ' + p.folder + ' | itemId=' + p.itemId + ' | xlsx=' + p.xlsxRows + ' rows'
    ),
  ];
  fs.writeFileSync(path.join(ROOT, 'tracking.md'), tracking.join('\n'), 'utf-8');
  console.log('  Tracking written');
  
  // Generate the full product data
  // ... (will be fleshed out in subsequent phases)
  console.log('nDone!');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
