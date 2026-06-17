# products页：优化grid
p = r'F:\codex-yunxing\zishahu\src\app\[locale]\products\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# grid: grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
# 改为: grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
# 这样商品卡片更小，显示更多
old_grid = 'grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
new_grid = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
c = c.replace(old_grid, new_grid)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print('6a. \u5546\u54c1\u5217\u8868grid\u5df2\u4f18\u5316')
