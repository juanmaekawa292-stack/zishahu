import re

# ===== 1. ITEMS_PER_PAGE 9 -> 20 =====
p = r'F:\codex-yunxing\zishahu\src\app\[locale]\products\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('ITEMS_PER_PAGE = 9', 'ITEMS_PER_PAGE = 20')
with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print('1. ITEMS_PER_PAGE -> 20')

# ===== 2. 合并同类壶型 =====
# 在products.ts里替换specs.shapeType的值
dp = r'F:\codex-yunxing\zishahu\src\data\products.ts'
with open(dp, 'r', encoding='utf-8') as f:
    dc = f.read()

shape_merge = {
    '\u77f3\u74e2': '\u77f3\u74e2\u58f6',
    '\u5b50\u51b6\u77f3\u74e2': '\u77f3\u74e2\u58f6',
    '\u4eff\u53e4': '\u4eff\u53e4\u58f6',
    '\u4eff\u53e4\u5982\u610f': '\u4eff\u53e4\u58f6',
    '\u897f\u65bd': '\u897f\u65bd\u58f6',
    '\u5982\u610f': '\u897f\u65bd\u58f6',
    '\u6c49\u74e6': '\u6c49\u74e6\u58f6',
    '\u9ad8\u6c49\u74e6': '\u6c49\u74e6\u58f6',
    '\u5fb7\u949f': '\u5fb7\u949f\u58f6',
    '\u9f99\u86cb': '\u9f99\u86cb\u58f6',
    '\u6c34\u5e73': '\u6c34\u5e73\u58f6',
    '\u6c49\u94ce': '\u6c49\u94ce\u58f6',
    '\u6387\u7403': '\u6387\u7403\u58f6',
    '\u79e6\u6743': '\u79e6\u6743\u58f6',
    '\u6387\u53ea': '\u6387\u53ea\u58f6',
    '\u5f52\u517d': '\u5f52\u517d\u58f6',
    '\u9ad8\u6f58\u58f6': '\u6f58\u58f6',
    '\u5bb9\u5929\u58f6': '\u5bb9\u5929',
    '\u5bd2\u6c5f\u58f6': '\u5bd2\u6c5f\u58f6',
    '\u7af9\u8282\u58f6': '\u7af9\u8282\u58f6',
}

for old_val, new_val in shape_merge.items():
    dc = dc.replace(f'\"shapeType\": \"{old_val}\"', f'\"shapeType\": \"{new_val}\"')

with open(dp, 'w', encoding='utf-8') as f:
    f.write(dc)
print(f'2. \u58f6\u578b\u5408\u5e76\u5b8c\u6210')

# 更新shapes定义
# 从数据中提取合并后的实际值
spec_values = set()
for m in re.finditer(r'\"shapeType\":\s*\"([^\"]+)\"', dc):
    spec_values.add(m.group(1))

# 常见经典壶型（固定前几排）
common_shapes = [
    '\u77f3\u74e2\u58f6', '\u897f\u65bd\u58f6', '\u4eff\u53e4\u58f6',
    '\u6c49\u74e6\u58f6', '\u5fb7\u949f\u58f6', '\u9f99\u86cb\u58f6',
    '\u6387\u7403\u58f6', '\u79e6\u6743\u58f6', '\u6c34\u5e73\u58f6',
    '\u6c49\u94ce\u58f6', '\u601d\u4ead\u58f6', '\u63d0\u6881\u58f6',
    '\u4f9b\u6625\u58f6', '\u6387\u53ea\u58f6', '\u5f52\u517d\u58f6',
    '\u9f99\u86cb\u58f6',
]

# 剩余的
remaining = sorted([s for s in spec_values if s not in common_shapes])

# 构建shapes定义
shapes_lines = ['export const shapes = [']
shapes_lines.append('    { key: "all", label_zhCN: "全部壶型", label_zhTW: "全部壺型" },')

# 先常见，后其他
all_ordered = common_shapes + remaining
for s in all_ordered:
    tw = s.replace('\u58f6', '\u58fa') if '\u58f6' in s else s
    shapes_lines.append(f'    {{ key: "{s}", label_zhCN: "{s}", label_zhTW: "{tw}" }},')
shapes_lines.append('  ];')
new_shapes = '\n'.join(shapes_lines)

old_shape_block = re.search(r'export const shapes = \[.*?\];', dc, re.DOTALL)
if old_shape_block:
    dc = dc.replace(old_shape_block.group(), new_shapes)
    print(f'3. \u5e38\u89c1\u58f6\u578b\u56fa\u5b9a\u524d{len(common_shapes)}\u4e2a\uff0c\u5171{len(spec_values)}\u4e2a\u58f6\u578b')
else:
    print('WARN: \u627e\u4e0d\u5230shapes\u5b9a\u4e49')

with open(dp, 'w', encoding='utf-8') as f:
    f.write(dc)
