import re
p = r'F:\codex-yunxing\zishahu\src\data\products.ts'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
m = re.search(r'export const shapes = \[.*?\];', c, re.DOTALL)
print(m.group()[:500] if m else 'NOT FOUND')
