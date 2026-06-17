p = r'F:\codex-yunxing\zishahu\src\components\product\ProductCard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# 去掉折扣标签(originalPrice badge)
old = '''          {product.originalPrice && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </Badge>
          )}
          
          '''

c = c.replace(old, '')
with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print('5. \u6298\u6263\u6807\u7b7e\u5df2\u79fb\u9664')
