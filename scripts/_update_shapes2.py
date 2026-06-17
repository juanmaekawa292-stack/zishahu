import re

p = r'F:\codex-yunxing\zishahu\src\data\products.ts'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# specs实际值（从之前的分析）
actual_spec_values = [
    "仿古", "仿古壶", "仿古如意", "侧把", "君德", "喜瓢", "四方壶",
    "圆珠", "如意", "子冶石瓢", "容天壶", "寒江壶", "巨轮",
    "平盖莲子", "归兽", "德钟", "德钟壶", "思亭", "扁腹",
    "手抓壶", "掇只", "掇只壶", "掇球壶", "明炉", "曲壶",
    "水平", "水平壶", "汉瓦", "汉瓦壶", "汉铎", "潘壶",
    "石瓢", "石瓢壶", "祥龙云肩", "秦权", "秦权壶", "竹段",
    "竹节壶", "美人肩", "西施壶", "高执", "高汉瓦", "高潘壶",
    "龙蛋", "龙蛋壶",
]

# 构建新的shapes定义
lines = ['export const shapes = [']
lines.append('    { key: "all", label_zhCN: "全部壶型", label_zhTW: "全部壺型" },')

# 去重并排序
unique_shapes = sorted(set(actual_spec_values))
for s in unique_shapes:
    tw = s.replace('\u58f6', '\u58fa') if '\u58f6' in s else s
    lines.append(f'    {{ key: "{s}", label_zhCN: "{s}", label_zhTW: "{tw}" }},')

lines.append('  ];')
new_shapes = '\n'.join(lines)

# 替换
old_pattern = r'export const shapes = \[.*?\];'
c = re.sub(old_pattern, new_shapes, c, flags=re.DOTALL)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print('shapes \u5df2\u66f4\u65b0\u4e3a', len(unique_shapes), '\u4e2a\u58f6\u578b')
