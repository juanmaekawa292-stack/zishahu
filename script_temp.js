const fs = require('fs');
const path = require('path');

const filePath = path.resolve('F:/codex-yunxing/zishahu/src/data/products.ts');
const content = fs.readFileSync(filePath, 'utf16le');
const lines = content.split('\n');
const fullText = content;

// Extract all product objects
let productTexts = [];
let braceDepth = 0;
let currentObj = '';
let inObj = false;

for (let i = 0; i < fullText.length; i++) {
  const ch = fullText[i];
  if (ch === '{' && !inObj) {
    inObj = true;
    braceDepth = 1;
    currentObj = '{';
  } else if (ch === '{' && inObj) {
    braceDepth++;
    currentObj += ch;
  } else if (ch === '}' && inObj) {
    braceDepth--;
    currentObj += ch;
    if (braceDepth === 0) {
      if (currentObj.includes('id:') && currentObj.includes('slug:')) {
        productTexts.push(currentObj);
      }
      inObj = false;
      currentObj = '';
    }
  } else if (inObj) {
    currentObj += ch;
  }
}

// Deduplicate
const ids = new Set();
const uniqueProducts = [];
for (const p of productTexts) {
  const idMatch = p.match(/id:\s*"([^"]+)"/);
  if (idMatch && !ids.has(idMatch[1])) {
    ids.add(idMatch[1]);
    uniqueProducts.push(p);
  }
}

// Extract shapes
const shapeSet = new Set();
for (const p of uniqueProducts) {
  const shapeMatch = p.match(/shape:\s*"([^"]+)"/);
  if (shapeMatch) shapeSet.add(shapeMatch[1]);
}

const activeShapes = ['all', ...Array.from(shapeSet)];
const tcMap = {
  '\u77f3\u74e2\u58f6': '\u77f3\u74e2\u58fa',
  '\u79e6\u6743\u58f6': '\u79e6\u6b0a\u58fa'
};

const productList = uniqueProducts.map(p => '  ' + p.trim()).join(',\n');

const lines_out = [];
lines_out.push('import { Product } from "@/types";');
lines_out.push('');
lines_out.push('');
lines_out.push('export const products: Product[] = [');
lines_out.push(productList);
lines_out.push('];');
lines_out.push('');
lines_out.push('export const categories = [');
lines_out.push('  { key: "all", label_zhCN: "\u5168\u90e8", label_zhTW: "\u5168\u90e8" },');
lines_out.push('  { key: "teapot", label_zhCN: "\u7d2b\u7802\u58f6", label_zhTW: "\u7d2b\u7802\u58fa" },');
lines_out.push('  { key: "cup", label_zhCN: "\u8336\u676f", label_zhTW: "\u8336\u676f" },');
lines_out.push('  { key: "teaPet", label_zhCN: "\u8336\u5ba0", label_zhTW: "\u8336\u5bf5" },');
lines_out.push('  { key: "teaTool", label_zhCN: "\u8336\u5177\u914d\u4ef6", label_zhTW: "\u8336\u5177\u914d\u4ef6" },');
lines_out.push('  { key: "gift", label_zhCN: "\u793c\u54c1\u5957\u88c5", label_zhTW: "\u79ae\u54c1\u5957\u88dd" },');
lines_out.push('];');
lines_out.push('');
lines_out.push('export const shapes = [');
lines_out.push('  { key: "all", label_zhCN: "\u5168\u90e8\u58f6\u578b", label_zhTW: "\u5168\u90e8\u58fa\u578b" },');
for (const s of activeShapes) {
  if (s === 'all') continue;
  const tc = tcMap[s] || s;
  lines_out.push('  { key: "' + s + '", label_zhCN: "' + s + '", label_zhTW: "' + tc + '" },');
}
lines_out.push('];');
lines_out.push('');

fs.writeFileSync(filePath, lines_out.join('\n'), 'utf8');
console.log('File rewritten as UTF-8 successfully!');
