const fs = require("fs");
const path = "F:/codex-yunxing/zishahu/src/app/[locale]/products/[slug]/page.tsx";
let c = fs.readFileSync(path, "utf-8");

// Replace the page function to use headers fallback for slug
// Find the current function signature
const funcStart = "export default async function ProductDetailPage({";
const funcMatch = c.indexOf(funcStart);
if (funcMatch < 0) { console.log("ERROR: Function not found"); process.exit(1); }

// Find the current params and slug extraction
const oldParams = c.substring(funcMatch, funcMatch + 200);
console.log("Current params:\n" + oldParams);

// Replace the entire slug extraction section
const slugLine = "const { slug } = params;";
const productLine = "const product = getProductBySlug(slug);";
const slugIdx = c.indexOf(slugLine);
const productIdx = c.indexOf(productLine);

if (slugIdx < 0 || productIdx < 0) { console.log("ERROR: Lines not found"); process.exit(1); }

// Create new code
const beforeCode = c.substring(0, slugIdx);
const afterCode = c.substring(productIdx);

const newCode = beforeCode + `  let slug = params?.slug || "";
  let locale = params?.locale || "zh-CN";

  // Next.js 16.x bug: params.slug is undefined in production
  // Fallback: extract slug from request headers
  if (!slug) {
    try {
      const h = require("next/headers").headers();
      // Wait for promise if needed
      const headersObj = h instanceof Promise ? await h : h;
      slug = headersObj.get("x-next-url") || 
             headersObj.get("x-url") || 
             headersObj.get("x-invoke-path") || 
             "";
      slug = slug.split("/").filter(Boolean).pop() || "";
    } catch(e) {
      // ignore - use empty slug
    }
  }
  
  const product = getProductBySlug(slug);
` + afterCode.substring(productLine.length);

fs.writeFileSync(path, newCode);
console.log("Fixed: added headers-based slug fallback");
