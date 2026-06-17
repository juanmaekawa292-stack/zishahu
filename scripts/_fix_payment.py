import os

p = r'F:\codex-yunxing\zishahu\src\app\[locale]\checkout\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# 把支付方式列表替换为只有连连支付
old = '''{ id: "stripe", label: tCheckout("stripe"), Icon: CreditCard },
                { id: "paypal", label: tCheckout("paypal"), Icon: DollarSvg },
                { id: "lianlian", label: "\u8fde\u8fde\u652f\u4ed8", Icon: CreditCard },'''

new = '''{ id: "lianlian", label: "\u8fde\u8fde\u652f\u4ed8", Icon: CreditCard },'''

c = c.replace(old, new)

# 初始化 paymentMethod 改为 lianlian
c = c.replace('useState("stripe")', 'useState("lianlian")')

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print('\u5df2\u66f4\u65b0\u652f\u4ed8\u65b9\u5f0f\u4e3a\u53ea\u6709\u8fde\u8fde\u652f\u4ed8')
