#!/usr/bin/env python3
import re, html, os, json

ts_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "products.ts")
with open(ts_path, "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("products: Product[] = ")
idx += len("products: Product[] = ")

depth = 0
in_single = False
in_double = False
start = idx
end = start
i = start
while i < len(content):
    c = content[i]
    if in_single:
        if content[i:i+2] == "\\'": i += 2; continue
        in_single = (c != "'"); i += 1; continue
    if in_double:
        if content[i:i+2] == '\\"': i += 2; continue
        in_double = (c != '"'); i += 1; continue
    if c == "'" and not in_double: in_single = True; i += 1; continue
    if c == '"' and not in_single: in_double = True; i += 1; continue
    if c == "[": depth += 1; i += 1; continue
    if c == "]":
        depth -= 1
        if depth == 0: end = i + 1; break
    i += 1

array_str = content[start:end]
print(f"Array length: {len(array_str)} chars")

# Convert single-quote TS strings to double-quote JSON
result = []
i = 0
in_str = False
while i < len(array_str):
    c = array_str[i]
    if not in_str and c == "'":
        in_str = True
        result.append('"')
        i += 1
        continue
    if in_str and c == "'":
        in_str = False
        result.append('"')
        i += 1
        continue
    if in_str:
        if c == "\\" and i+1 < len(array_str) and array_str[i+1] == "'":
            result.append("'")
            i += 2
            continue
        if c == "\n":
            result.append("\\n")
            i += 1
            continue
        if c == "\r":
            i += 1
            continue
        if c == '"':
            result.append('\\"')
            i += 1
            continue
    result.append(c)
    i += 1

json_str = "".join(result)
json_str = re.sub(r',\s*([}\]])', r"\1", json_str)
json_str = re.sub(r'(?<=[{,])\s*(\w+)\s*(?=:)', r'"\1"', json_str)

products = json.loads(json_str)
print(f"Parsed {len(products)} products")

def esc(s):
    return html.escape(str(s or "")).replace("\n"," ").replace("\r","")

entries = []
for p in products:
    if not p or not isinstance(p, dict): continue
    sku = p.get("sourceSku") or p.get("id") or ""
    title = p.get("title_en") or p.get("title_zhCN") or ""
    desc = p.get("description_en") or p.get("description_zhCN") or ""
    price = float(p.get("price", 0))
    images = p.get("images", [])
    image = images[0] if images else ""
    slug = p.get("slug", "")
    instock = p.get("inStock", True) != False
    pid = p.get("id", "")
    entries.append("    <item>")
    entries.append(f'      <g:id>{esc(sku)}</g:id>')
    entries.append(f'      <g:title>{esc(title[:150])}</g:title>')
    entries.append(f'      <g:description>{esc(desc[:5000])}</g:description>')
    entries.append(f'      <g:link>https://zishapro.com/en/products/{esc(slug)}</g:link>')
    if image: entries.append(f'      <g:image_link>{esc(image)}</g:image_link>')
    entries.append(f'      <g:price>{price:.2f} USD</g:price>')
    entries.append(f'      <g:availability>{"in_stock" if instock else "out_of_stock"}</g:availability>')
    entries.append(f'      <g:brand>紫砂雅集</g:brand>')
    entries.append(f'      <g:condition>new</g:condition>')
    entries.append(f'      <g:mpn>{esc(pid)}</g:mpn>')
    entries.append("    </item>")

xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n'
xml += '  <channel>\n'
xml += '    <title>紫砂雅集 - Google Shopping Feed</title>\n'
xml += '    <link>https://zishapro.com</link>\n'
xml += '    <description>Yixing Zisha Teapots - Handmade Tea Sets</description>\n'
xml += '\n'.join(entries) + '\n'
xml += '  </channel>\n</rss>\n'

out_path = os.path.join(os.path.dirname(__file__), "..", "public", "google-merchant.xml")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(xml)
print(f"Generated: public/google-merchant.xml ({len(products)} products)")
print(f"URL: https://zishapro.com/google-merchant.xml")