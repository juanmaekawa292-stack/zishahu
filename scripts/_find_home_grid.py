p = r'F:\codex-yunxing\zishahu\src\app\[locale]\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
# 找grid
import re
for m in re.finditer(r'grid-cols-\S*|max-w-\S*|gap-\S*', c):
    start = max(0, m.start()-40)
    end = min(len(c), m.end()+40)
    seg = c[start:end].replace('\n', ' ').strip()
    print(f'...{seg[:120]}...')
