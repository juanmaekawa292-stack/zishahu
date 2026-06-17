# 首页商品grid
p = r'F:\codex-yunxing\zishahu\src\app\[locale]\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# 首页精选商品: grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4
c = c.replace(
    'grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4',
    'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
)
# 首页新品: grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4
c = c.replace(
    'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4',
    'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print('6b. \u9996\u9875grid\u5df2\u4f18\u5316')
