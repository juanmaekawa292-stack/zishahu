p = r'F:\codex-yunxing\zishahu\src\components\product\ProductDetailContent.tsx'
with open(p, 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()
# 找布局相关
for i, line in enumerate(lines):
    if 'max-w-' in line or 'grid' in line or 'gap-' in line:
        if 'Image' not in line and 'import' not in line:
            print(f'{i+1}: {line.rstrip()[:150]}')
