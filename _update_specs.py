import sys, os, re, json
sys.path.insert(0, 'F:/codex-yunxing/紫砂壶管理系统')
import scanner, store_writer as sw

TUKUAI = 'D:/图快下载器/淘宝采集'

SPEC_KEYS = {
    "\u5bb9\u91cf": "capacity",
    "\u6750\u8d28": "clay",
    "\u5de5\u827a\u7c7b\u578b": "craft",
    "\u4ea7\u5730": "origin",
    "\u662f\u5426\u624b\u5de5": "handmade",
    "\u70e7\u5236\u7a91\u578b": "firingType",
    "\u9002\u7528\u573a\u666f": "scenario",
    "\u6e05\u6d17\u65b9\u5f0f": "cleaning",
    "\u5305\u88c5\u5f62\u5f0f": "packaging",
    "\u7a91\u7cfb": "kiln",
    "\u5e74\u4ee3": "year",
    "\u58f6\u578b": "shapeType",
    "\u5c3a\u5bf8": "dimensions",
}

def parse_sp(folder):
    sp = {}
    txt = os.path.join(folder, "\u9875\u9762\u6570\u636e.txt")
    if not os.path.isfile(txt): return sp
    with open(txt, "r", encoding="utf-8-sig") as f:
        for line in f.read().splitlines():
            line = line.strip()
            if not line.startswith("\u53c2\u6570"): continue
            for pair in line.split(";"):
                pair = pair.strip()
                for cn, en in SPEC_KEYS.items():
                    for sep in [":", "\uff1a"]:
                        p = cn + sep
                        if pair.startswith(p):
                            sp[en] = pair[len(p):].strip()
                            break
    return sp

# Build folder list
folders = []
for batch in ["0615", "616"]:
    bd = os.path.join(TUKUAI, batch)
    for sub in sorted(os.listdir(bd)):
        fp = os.path.join(bd, sub)
        if os.path.isdir(fp): folders.append(fp)
print("Folders:", len(folders))

# Read products.ts
pts = "F:/codex-yunxing/zishahu/src/data/products.ts"
with open(pts, "r", encoding="utf-8") as f:
    c = f.read()

# Update specs for each product
count = 0
for i, folder in enumerate(folders):
    pid = "tk-" + str(i + 1).zfill(3)
    specs = parse_sp(folder)
    if not specs:
        continue
    idx = c.find('id: "' + pid + '"')
    if idx < 0:
        continue
    si = c.find("specs: {}", idx)
    if si < 0:
        continue
    spec_str = "specs: { " + ", ".join(k + ': "' + v.replace("\", "\\\\").replace(""", "\\\"") + '"' for k, v in specs.items()) + " }"
    c = c[:si] + spec_str + c[si + len("specs: {}"):]
    count += 1

with open(pts, "w", encoding="utf-8") as f:
    f.write(c)

# Verify
specs_found = len(re.findall(r'specs: \{[a-z]', c))
print("Updated:", count, "products with specs")
print("Total with specs:", specs_found)
