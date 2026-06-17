p = r'F:\codex-yunxing\zishahu\src\app\[locale]\products\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
# 找grid相关
import re
for m in re.finditer(r'grid-cols-\S*|max-w-\S*|gap-\S*', c):
    start = max(0, m.start()-30)
    end = min(len(c), m.end()+30)
    print(f'...{c[start:end].strip()[:100]}...')
