p = r'F:\codex-yunxing\zishahu\src\components\product\ProductDetailContent.tsx'
with open(p, 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()
# 图片区域
for i in range(155, 245):
    print(f'{i+1}: {lines[i].rstrip()[:180]}')
