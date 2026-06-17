import re

with open(r'F:\codex-yunxing\zishahu\src\data\products.ts', 'r', encoding='utf-8-sig') as f:
    content = f.read()

start = content.index('[')
end = content.rindex('];') + 2
array_text = content[start:end]

products_text = []
depth = 0
current = ''
for ch in array_text:
    if ch == '{':
        if depth == 0:
            current = ''
        depth += 1
        current += ch
    elif ch == '}':
        depth -= 1
        current += ch
        if depth == 0 and current.strip():
            products_text.append(current.strip())
    elif depth > 0:
        current += ch

# 统计specs里的字段
from collections import Counter
spec_fields = Counter()
shape_types = set()
no_shape = 0
has_shape = 0

for p in products_text:
    if '"shape"' in p:
        has_shape += 1
    else:
        no_shape += 1
    
    st = re.search(r'"shapeType":\s*"([^"]+)"', p)
    if st:
        shape_types.add(st.group(1))
    
    # 收集specs里的所有字段
    specs_m = re.search(r'"specs":\s*\{([^}]+)\}', p)
    if specs_m:
        fields = re.findall(r'"([^"]+)":', specs_m.group(1))
        for f in fields:
            spec_fields[f] += 1

print(f'\u5df2\u6709shape: {has_shape}, \u6ca1\u6709shape: {no_shape}')
print(f'\nspecs\u5b57\u6bb5\u7edf\u8ba1:')
for f, c in spec_fields.most_common():
    print(f'  {f}: {c}')

print(f'\nspecs.shapeType \u503c:')
for s in sorted(shape_types):
    print(f'  "{s}"')
