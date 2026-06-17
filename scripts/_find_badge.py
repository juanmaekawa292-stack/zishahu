p = r'F:\codex-yunxing\zishahu\src\components\product\ProductCard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# 找到折扣标签部分 - Badge variant="destructive"
idx = c.find('Badge variant="destructive"')
if idx == -1:
    idx = c.find('Badge variant=')
print(c[idx:idx+300] if idx >= 0 else 'NOT FOUND')
