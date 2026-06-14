const fs = require('fs');
const path = require('path');

const filePath = path.resolve('F:/codex-yunxing/zishahu/src/data/products.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find the position after "];" that closes the products array
// The structure is: ... product array ... ]; export const categories = ...
const insertionPoint = content.indexOf('];\n\nexport const categories');
if (insertionPoint === -1) {
  console.log('ERROR: Could not find insertion point');
  process.exit(1);
}

const toInsert = `];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug) || null;
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id) || null;
}

export const countries = [
  { code: "US", name_zhCN: "??", name_zhTW: "??" },
  { code: "CA", name_zhCN: "???", name_zhTW: "???" },
  { code: "GB", name_zhCN: "??", name_zhTW: "??" },
  { code: "AU", name_zhCN: "????", name_zhTW: "????" },
  { code: "NZ", name_zhCN: "???", name_zhTW: "???" },
  { code: "JP", name_zhCN: "??", name_zhTW: "??" },
  { code: "KR", name_zhCN: "??", name_zhTW: "??" },
  { code: "SG", name_zhCN: "???", name_zhTW: "???" },
  { code: "MY", name_zhCN: "????", name_zhTW: "????" },
  { code: "TH", name_zhCN: "??", name_zhTW: "??" },
  { code: "VN", name_zhCN: "??", name_zhTW: "??" },
  { code: "TW", name_zhCN: "??", name_zhTW: "??" },
  { code: "HK", name_zhCN: "??", name_zhTW: "??" },
  { code: "MO", name_zhCN: "??", name_zhTW: "??" },
  { code: "DE", name_zhCN: "??", name_zhTW: "??" },
  { code: "FR", name_zhCN: "??", name_zhTW: "??" },
  { code: "IT", name_zhCN: "???", name_zhTW: "???" },
  { code: "ES", name_zhCN: "???", name_zhTW: "???" },
  { code: "NL", name_zhCN: "??", name_zhTW: "??" },
  { code: "CH", name_zhCN: "??", name_zhTW: "??" },
  { code: "SE", name_zhCN: "??", name_zhTW: "??" },
  { code: "NO", name_zhCN: "??", name_zhTW: "??" },
  { code: "DK", name_zhCN: "??", name_zhTW: "??" },
  { code: "FI", name_zhCN: "??", name_zhTW: "??" },
  { code: "AT", name_zhCN: "???", name_zhTW: "???" },
  { code: "IE", name_zhCN: "???", name_zhTW: "???" },
  { code: "BE", name_zhCN: "???", name_zhTW: "???" },
  { code: "PT", name_zhCN: "???", name_zhTW: "???" },
  { code: "PL", name_zhCN: "??", name_zhTW: "??" },
  { code: "CZ", name_zhCN: "??", name_zhTW: "??" },
  { code: "GR", name_zhCN: "??", name_zhTW: "??" },
  { code: "HU", name_zhCN: "???", name_zhTW: "???" },
  { code: "RO", name_zhCN: "????", name_zhTW: "????" },
  { code: "IL", name_zhCN: "???", name_zhTW: "???" },
  { code: "AE", name_zhCN: "???", name_zhTW: "???" },
  { code: "SA", name_zhCN: "?????", name_zhTW: "??????" },
  { code: "ZA", name_zhCN: "??", name_zhTW: "??" },
  { code: "BR", name_zhCN: "??", name_zhTW: "??" },
  { code: "MX", name_zhCN: "???", name_zhTW: "???" },
  { code: "AR", name_zhCN: "???", name_zhTW: "???" },
  { code: "CL", name_zhCN: "??", name_zhTW: "??" },
  { code: "IN", name_zhCN: "??", name_zhTW: "??" },
  { code: "ID", name_zhCN: "??", name_zhTW: "??" },
  { code: "PH", name_zhCN: "???", name_zhTW: "???" },
  { code: "RU", name_zhCN: "???", name_zhTW: "???" },
  { code: "TR", name_zhCN: "???", name_zhTW: "???" },
];

export const categories`;

content = content.substring(0, insertionPoint) + toInsert + content.substring(insertionPoint + '];\n\nexport const categories'.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added getProductBySlug and countries!');
