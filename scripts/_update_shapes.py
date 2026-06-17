import re

with open(r'F:\codex-yunxing\zishahu\src\data\products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# \u66f4\u65b0 shapes \u5b9a\u4e49\u4e3a\u5b9e\u9645\u58f6\u578b\u5217\u8868
# \u627e\u5230 export const shapes
old_shapes = '''export const shapes = [
    { key: "all", label_zhCN: "\u5168\u90e8\u58f6\u578b", label_zhTW: "\u5168\u90e8\u58fa\u578b" },
    { key: "\u77f3\u74e2\u58f6", label_zhCN: "\u77f3\u74e2\u58f6", label_zhTW: "\u77f3\u74e2\u58fa" },
    { key: "\u5f52\u517d\u58f6", label_zhCN: "\u5f52\u517d\u58f6", label_zhTW: "\u5f52\u7378\u58fa" },
    { key: "\u897f\u65bd\u58f6", label_zhCN: "\u897f\u65bd\u58f6", label_zhTW: "\u897f\u65bd\u58fa" },
    { key: "\u4eff\u53e4\u58f6", label_zhCN: "\u4eff\u53e4\u58f6", label_zhTW: "\u4eff\u53e4\u58fa" },
    { key: "\u6387\u7403\u58f6", label_zhCN: "\u6387\u7403\u58f6", label_zhTW: "\u6387\u7403\u58fa" },
    { key: "\u4f9b\u6625\u58f6", label_zhCN: "\u4f9b\u6625\u58f6", label_zhTW: "\u4f9b\u6625\u58fa" },
    { key: "\u63d0\u6881\u58f6", label_zhCN: "\u63d0\u6881\u58f6", label_zhTW: "\u63d0\u6881\u58fa" },
    { key: "\u65b9\u5668", label_zhCN: "\u65b9\u5668", label_zhTW: "\u65b9\u5668" },
    { key: "\u82b1\u5668", label_zhCN: "\u82b1\u5668", label_zhTW: "\u82b1\u5668" },
  ];'''

# \u5b9e\u9645\u58f6\u578b\u5217\u8868
actual_shapes = [
    "全部壶型", "石瓢壶", "西施壶", "仿古壶", "汉瓦壶", "德钟壶",
    "掇球壶", "秦权壶", "龙蛋壶", "水平壶", "汉铎壶", "思亭壶",
    "四方壶", "竹节壶", "美人肩", "石瓢", "仿古", "汉瓦",
    "德钟", "龙蛋", "水平", "汉铎", "掇球", "秦权",
    "侧把", "君德", "喜瓢", "圆珠", "如意", "子冶石瓢",
    "容天壶", "寒江壶", "巨轮", "平盖莲子", "归兽",
    "扁腹", "手抓壶", "掇只", "明炉", "曲壶", "潘壶",
    "祥龙云肩", "竹段", "高执", "高汉瓦", "高潘壶", "方器", "花器",
    "归兽壶", "仿古如意", "掇只壶",
]

# \u53bb\u91cd\u5e76\u6392\u5e8f
unique_shapes = []
seen = set()
for s in actual_shapes:
    if s not in seen and s != "全部壶型":
        seen.add(s)
        unique_shapes.append(s)

new_shapes = 'export const shapes = [\n    { key: "all", label_zhCN: "全部壶型", label_zhTW: "全部壺型" },'
for s in sorted(unique_shapes):
    tw = s.replace('\u58f6', '\u58fa') if '\u58f6' in s else s
    new_shapes += f'\n    {{ key: "{s}", label_zhCN: "{s}", label_zhTW: "{tw}" }},'
new_shapes += '\n  ];'

content = content.replace(old_shapes, new_shapes)

with open(r'F:\codex-yunxing\zishahu\src\data\products.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\u5df2\u66f4\u65b0 shapes \u5b9a\u4e49\u4e3a\u5b9e\u9645\u58f6\u578b\u5217\u8868')
