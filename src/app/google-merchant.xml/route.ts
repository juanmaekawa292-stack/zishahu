import { products } from "@/data/products";

export async function GET() {
  const entries: string[] = [];
  for (const p of products) {
    if (!p || !p.slug) continue;
    const sku = p.sourceSku || p.id || "";
    const title = (p.title_en || p.title_zhCN || "").slice(0, 150);
    const desc = (p.description_en || p.description_zhCN || "").slice(0, 5000);
    const image = p.images?.[0] || "";
    const price = Number(p.price).toFixed(2);
    const instock = p.inStock !== false;

    entries.push(`    <item>
      <g:id>${esc(sku)}</g:id>
      <g:title>${esc(title)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>https://zishapro.com/en/products/${esc(p.slug)}</g:link>
      ${image ? `<g:image_link>${esc(image)}</g:image_link>` : ""}
      <g:price>${price} USD</g:price>
      <g:availability>${instock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:brand>紫砂雅集</g:brand>
      <g:condition>new</g:condition>
      <g:mpn>${esc(p.id || "")}</g:mpn>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>紫砂雅集 - Google Shopping Feed</title>
    <link>https://zishapro.com</link>
    <description>Yixing Zisha Teapots - Handmade Tea Sets</description>
${entries.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function esc(s: string): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[\x00-\x1F]/g, "");
}