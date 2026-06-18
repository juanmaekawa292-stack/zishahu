with open("src/data/products.ts","r",encoding="utf-8") as f:
    lines = f.readlines()
for i in range(15285, 15298):
    print(repr(lines[i]))
