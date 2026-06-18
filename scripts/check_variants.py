with open("src/data/products.ts","r",encoding="utf-8") as f:
    c = f.read()
print("variant_01:", "variant_tk-192-01" in c)
print("variant_04:", "variant_tk-192-04" in c)
print("tk-192 images:", c.count("tk-192"))
