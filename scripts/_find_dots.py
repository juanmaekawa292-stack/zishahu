p = r'F:\codex-yunxing\zishahu\src\components\product\ProductDetailContent.tsx'
with open(p, 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()
# Show lines 200-220 (the dots section)
for i in range(199, min(220, len(lines))):
    print(f'{i+1}: {lines[i].rstrip()[:200]}')
