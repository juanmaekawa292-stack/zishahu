import os
os.chdir("F:/codex-yunxing/zishahu")

with open("src/components/product/ProductDetailContent.tsx", "rb") as f:
    data = f.read()

fixed = 0

# Fix 1: ", setIsClient]" -> "const [isClient, setIsClient]"
old1 = b", setIsClient] = useState(false);"
new1 = b"const [isClient, setIsClient] = useState(false);"
if old1 in data:
    data = data.replace(old1, new1)
    fixed += 1
    print(f"Fix 1 done: line 49")

# Fix 2: Featured badge garbled text
# current: locale === "zh-TW" ? "绮鹃伕" : "绮鹃€?)}
# should:  locale === "zh-TW" ? "精選" : "精选")}
old2 = b'\xef\xbc\x9f "Featured" : (locale === "zh-TW" ? "'
# Actually let me search for the garbled pattern differently
text = data.decode("utf-8", errors="replace")
print(f"Garbled check 1: {'绮鹃' in text}")
print(f"Garbled check 2: {'鏈€' in text}")
print(f"Garbled check 3: {'宸叉' in text}")
print(f"Garbled check 4: {'缂栬' in text}")
