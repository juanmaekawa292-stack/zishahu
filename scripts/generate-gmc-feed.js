#!/usr/bin/env python3
"""Generate Google Merchant Center XML feed from products.ts"""
import re, html, os, json

ts_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "products.ts")
with open(ts_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the products array
idx = content.find("products: Product[] = ")
if idx < 0:
    idx = content.find("export const products")
    idx = content.find("=", idx)
else:
    idx += len("products: Product[] = ")

# Extract array manually tracking brackets and strings
depth = 0
in_single = False
in_double = False
start = idx
end = start
for i in range(start, len(content)):
    c = content[i]
    if in_single:
        in_single = content[i:i+2] != "\\'"
        continue
    if in_double:
        in_double = content[i:i+2] != '\\"'
        continue
    if c == "'" and not in_double:
        in_single = True
        continue
    if c == '"' and not in_single:
        in_double = True
        continue
    if c == "[":
        depth += 1
    elif c == "]":
        depth -= 1
        if depth == 0:
            end = i + 1
            break

array_str = content[start:end]

# Convert TS syntax to JSON
# 1. Fix single quotes in strings
result = []
i = 0
in_str = False
str_char = None
while i < len(array_str):
    c = array_str[i]
    if not in_str:
        if c == "'" or c == '"':
            # Check if this is a TypeScript key (followed by :)
            rest = array_str[i+1:]
            # Skip whitespace and check for :
            j = 0
            while j < len(rest) and rest[j] in " \t\n\r":
                j += 1
            if j < len(rest) and rest[j] == ":":
                # This is a TS key, wrap with double quotes
                result.append('"')
                i += 1
                # Read key name
                while i < len(array_str) and array_str[i] not in "'\"\n\r\t :,;[]{}":
                    result.append(array_str[i])
                    i += 1
                result.append('"')
                result.append(":")
                # Skip whitespace and colon
                continue
            # Check for TypeScript string key syntax
            elif c == "'":
                # Convert single-quote string to double-quote
                result.append('"')
                in_str = True
                str_char = "'"
                i += 1
                continue
        
        if c == "'":
            result.append('"')
            in_str = True
            str_char = "'"
            i += 1
            continue
        result.append(c)
        i += 1
    else:
        if c == "\\" and i + 1 < len(array_str):
            result.append(c)
            result.append(array_str[i+1])
            i += 2
            continue
        if c == str_char:
            result.append('"')
            in_str = False
            str_char = None
            i += 1
            continue
        # Escape internal double quotes if string was single-quoted
        if c == '"' and str_char == "'":
            result.append('\\"')
            i += 1
            continue
        result.append(c)
        i += 1

json_str = "".join(result)
# Remove trailing commas
json_str = re.sub(r',\s*([}\]])', r'\1', json_str)

products = json.loads(json_str)

output = []
output.append('<?xml version="1.0" encoding="UTF-8"?>')
output.append('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">')
output.append('  <channel>')
output.append('    <title>紫砂雅集 - Google Shopping Feed</title>')
output.append('    <link>https://zishapro.com</link>')
output.append('    <description>Yixing Zisha Teapots - Handmade Tea Sets</description>')

for p in products:
    if not p or not isinstance(p, dict):
        continue
    title = p.get("title_en") or p.get("title_zhCN") or ""
    desc = p.get("description_en") or p.get("description_zhCN") or ""
    price = p.get("price", 0)
    images = p.get("images", [])
    image = images[0] if images else ""
    sku = p.get("sourceSku") or p.get("id") or ""
    slug = p.get("slug", "")
    
    def esc(s):
        return html.escape(s or "").replace("\n", " ").replace("\r", "")
    
    output.append('    <item>')
    output.append(f'      <g:id>{esc(sku)}</g:id>')
    output.append(f'      <g:title>{esc(title[:150])}</g:title>')
    output.append(f'      <g:description>{esc(desc[:5000])}</g:description>')
    output.append(f'      <g:link>https://zishapro.com/en/products/{esc(slug)}</g:link>')
    if image:
        output.append(f'      <g:image_link>{esc(image)}</g:image_link>')
    output.append(f'      <g:price>{float(price):.2f} USD</g:price>')
    output.append(f'      <g:availability>{"in_stock" if p.get("inStock", True) else "out_of_stock"}</g:availability>')
    output.append(f'      <g:brand>紫砂雅集</g:brand>')
    output.append(f'      <g:condition>new</g:condition>')
    output.append(f'      <g:mpn>{esc(p.get("id", ""))}</g:mpn>')
    output.append('    </item>')

output.append('  </channel>')
output.append('</rss>')

out_path = os.path.join(os.path.dirname(__file__), "..", "public", "google-merchant.xml")
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(output))

print(f"✅ Generated GMC feed: {len(products)} products -> public/google-merchant.xml")
print(f"   URL: https://zishapro.com/google-merchant.xml")
