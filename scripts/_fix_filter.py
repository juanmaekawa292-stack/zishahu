p = r'F:\codex-yunxing\zishahu\src\app\[locale]\products\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
# Fix the triple quote issue
c = c.replace('shapeType || """"', 'shapeType || ""')
with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
