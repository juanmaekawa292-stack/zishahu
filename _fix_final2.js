const fs = require("fs");
const p = "F:/codex-yunxing/zishahu/src/app/[locale]/products/[slug]/page.tsx";
let c = fs.readFileSync(p, "utf-8");

// Add headers import
c = c.replace(
  'import { notFound } from "next/navigation";',
  'import { notFound } from "next/navigation";\nimport { headers } from "next/headers";'
);

// Fix generateMetadata - await params, then use p.slug
c = c.replace(
  "const { slug } = await params;\n  const product = products.find",
  "const p = await params;\n  const product = products.find"
);
c = c.replace(
  "export default async function ProductDetailPage({\n  params,\n}: {\n  params: Promise<{ slug: string }>;\n}) {\n  const { slug } = await params;\n  const product = getProductBySlug(slug);",
  'export default async function ProductDetailPage({\n  params,\n}: {\n  params: Promise<{ slug: string; locale: string }>;\n}) {\n  const p = await params;\n  let slug = p?.slug || "";\n  if (!slug) {\n    try { const k = headers(); const h = k instanceof Promise ? await k : k; slug = h.get("x-next-url") || h.get("x-url") || ""; slug = slug.split("/").filter(Boolean).pop() || ""; } catch(e) {}\n  }\n  const product = getProductBySlug(slug);'
);

fs.writeFileSync(p, c);
console.log("Fixed!");
