import re

with open("src/data/products.ts","r",encoding="utf-8") as f:
    content = f.read()

# Fix 1: specs: { -> "specs": {
content = content.replace("    specs: {", '    "specs": {', 1)

# Fix 2: variant images
cos_base = "https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/tk-192"

# tk-192-01
old1 = '"image": "",\n        "sku": "5205186139453"'
new1 = '"image": "' + cos_base + '/variant_tk-192-01.webp",\n        "sku": "5205186139453"'
content = content.replace(old1, new1)

# tk-192-02
old2 = '"image": "",\n        "sku": "5205186139454"'
new2 = '"image": "' + cos_base + '/variant_tk-192-02.webp",\n        "sku": "5205186139454"'
content = content.replace(old2, new2)

# tk-192-03
old3 = '"image": "",\n        "sku": "5205186139455"'
new3 = '"image": "' + cos_base + '/variant_tk-192-03.webp",\n        "sku": "5205186139455"'
content = content.replace(old3, new3)

# tk-192-04
old4 = '"image": "",\n        "sku": "5205186139456"'
new4 = '"image": "' + cos_base + '/variant_tk-192-04.webp",\n        "sku": "5205186139456"'
content = content.replace(old4, new4)

with open("src/data/products.ts","w",encoding="utf-8") as f:
    f.write(content)

# Verify
print("variant_01:", "variant_tk-192-01" in content)
print("variant_04:", "variant_tk-192-04" in content)
print("specs_quoted:", '"specs":' in content)
