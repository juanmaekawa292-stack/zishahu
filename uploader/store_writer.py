import os
import json

PRODUCTS_TS_PATH = r"F:\codex-yunxing\zishahu\src\data\products.ts"
SOURCE_JSON_PATH = r"F:\codex-yunxing\zishahu\data\source_products.json"

def get_next_id():
    """生成下一个产品 ID (tk-003, tk-004, ...)"""
    with open(PRODUCTS_TS_PATH, "r", encoding="utf-8-sig") as f:
        content = f.read()
    max_num = 2
    for m in __import__("re").findall(r'id:\s*"tk-(\d+)"', content):
        n = int(m)
        if n > max_num:
            max_num = n
    next_num = max_num + 1
    return {"id": f"tk-{next_num:03d}", "num": next_num}

def esc(s):
    if not s:
        return ""
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

def to_zh_tw_simple(text):
    m = {
        "壶":"壺","纯":"純","装":"裝","艺":"藝","龙":"龍","龟":"龜","兽":"獸",
        "归":"歸","汉":"漢","如":"如","意":"意","约":"約","单":"單","矿":"礦",
        "彩":"彩","绘":"繪","刻":"刻","素":"素","颜":"顏","礼":"禮","盒":"盒",
        "企":"企","业":"業","容":"容","量":"量","描":"描","金":"金","款":"款",
        "名":"名","家":"家","大":"大","新":"新","正":"正","宗":"宗","宜":"宜",
        "兴":"興","原":"原","泥":"泥","家":"家","用":"用","一":"一","二":"二",
        "三":"三","四":"四","五":"五","六":"六","七":"七","八":"八","九":"九",
        "十":"十",
    }
    return "".join(m.get(ch, ch) for ch in text)

def generate_product_entry(p):
    """生成 TypeScript product entry 字符串"""
    id_ = p["id"]
    fmt_imgs = lambda arr: ",\n".join(f'    "{s}"' for s in arr)

    # Variants
    varr = p.get("variants", [])
    vars_ts = "    variants: undefined,"
    if varr:
        lines = []
        for i, v in enumerate(varr):
            lines.append(f"      {{")
            lines.append(f'        id: "{id_}-v{i+1}",')
            lines.append(f'        name_zhCN: "{esc(v.get("name_zhCN",""))}",')
            lines.append(f'        name_zhTW: "{esc(v.get("name_zhTW",""))}",')
            lines.append(f"        price: {v['price']},")
            if v.get("originalPrice"):
                lines.append(f"        originalPrice: {v['originalPrice']},")
            lines.append(f"        stock: {v.get('stock', 50)},")
            lines.append(f'        image: "{v.get("image","")}",')
            if v.get("sku"):
                lines.append(f'        sku: "{v["sku"]}",')
            lines.append("      },")
        vars_ts = "    variants: [\n" + "\n".join(lines) + "\n    ],"

    # Specs
    specs = p.get("specs", {})
    spec_parts = []
    if specs.get("capacity"): spec_parts.append(f'capacity: "{esc(specs["capacity"])}"')
    if specs.get("clay"): spec_parts.append(f'clay: "{esc(specs["clay"])}"')
    if specs.get("craft"): spec_parts.append(f'craft: "{esc(specs["craft"])}"')
    spec_str = "{ " + ", ".join(spec_parts) + " }" if spec_parts else "{}"

    # Description
    desc = p.get("description_zhCN", "") or f'{p["title_zhCN"]}，精选优质原矿紫泥，全手工精制而成。壶型经典，出水顺畅，断水利落。紫砂材质透气性好，能保留茶叶的原始香气，越用越润。'

    entry = f"""  {{
    id: "{id_}",
    slug: "{esc(p['slug'])}",
    title_zhCN: "{esc(p['title_zhCN'])}",
    title_zhTW: "{esc(p['title_zhTW'])}",
    description_zhCN: "{esc(desc)}",
    description_zhTW: "{esc(p.get('description_zhTW','') or desc)}",
    price: {p['price']},
    {"originalPrice: " + str(p.get("originalPrice","")) + "," if p.get("originalPrice") else ""}
    images: [
{fmt_imgs(p['images'])}
    ],
    category: "{p['category']}",
    inStock: true,
    stock: 100,
     {f'shape: "{esc(p.get("shape", ""))}",' if p.get("shape") else ""}
    createdAt: "{p.get('createdAt', '2026-06-15')}",
    rating: 4.8,
    reviewCount: 0,
    detailImages: [
{fmt_imgs(p['detailImages'])}
    ],
{vars_ts}
    {f'sourceUrl: "{esc(p.get("sourceUrl",""))}",' if p.get("sourceUrl") else ""}
    {f'sourceSku: "{esc(p.get("sourceSku",""))}",' if p.get("sourceSku") else ""}
    videos: [
{fmt_imgs(p['videos'])}
    ],
    shipping: {{ weight: 1.5, dimensions: {{ length: 25, width: 20, height: 15 }} }},
    specs: {spec_str},
  }},"""

    return entry

def append_product_to_ts(entry_text):
    """在 products.ts 的 products 数组末尾插入新条目"""
    with open(PRODUCTS_TS_PATH, "r", encoding="utf-8-sig") as f:
        content = f.read()

    # 找到第一个 ];（products 数组结束）
    idx = content.index("];")
    before = content[:idx].rstrip()
    after = content[idx:]

    new_content = before + "\n" + entry_text + "\n" + after
    with open(PRODUCTS_TS_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True

def update_source_json(product_data):
    """更新 source_products.json"""
    data = {"products": []}
    if os.path.isfile(SOURCE_JSON_PATH):
        with open(SOURCE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

    new_entry = {
        "id": product_data["id"],
        "source_sku": product_data.get("sourceSku", ""),
        "source_url": product_data.get("sourceUrl", ""),
        "slug": product_data["slug"],
        "category": product_data["category"],
        "title_zhCN": product_data["title_zhCN"],
        "title_zhTW": product_data["title_zhTW"],
        "variants": [{"name": v.get("name_zhCN",""), "price": v["price"],
                       "original_price": v.get("originalPrice",v["price"]),
                       "sku_id": v.get("sku","")} for v in product_data.get("variants",[])],
        "images": product_data.get("images", []),
        "videos": product_data.get("videos", []),
        "specs": product_data.get("specs", {}),
        "date_uploaded": __import__("datetime").datetime.now().isoformat(),
    }

    found = False
    for i, p in enumerate(data["products"]):
        if p["id"] == product_data["id"]:
            data["products"][i].update(new_entry)
            found = True
            break
    if not found:
        data["products"].append(new_entry)

    with open(SOURCE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return True

def get_current_product_ids():
    """读取 products.ts 中现有产品的 ID 列表"""
    with open(PRODUCTS_TS_PATH, "r", encoding="utf-8-sig") as f:
        content = f.read()
    return __import__("re").findall(r'id:\s*"(tk-\d+)"', content)

