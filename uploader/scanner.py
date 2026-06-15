import os
import re
import json

SOURCE_DIRS = [
    r"D:\图快下载器\淘宝采集\00_古悦堂 宜兴紫砂壶套装纯手工正宗家用茶壶功夫茶具泡茶壶归兽壶",
    r"D:\图快下载器\淘宝采集\00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶",
    r"D:\图快下载器\淘宝采集\0615",
]

ZH_TW_MAP = {
    "壶":"壺","纯":"純","工":"工","艺":"藝","装":"裝","龙":"龍","凤":"鳳","龟":"龜",
    "兽":"獸","归":"歸","石":"石","瓢":"瓢","西":"西","施":"施","仿":"仿","古":"古",
    "汉":"漢","瓦":"瓦","如":"如","意":"意","圆":"圓","润":"潤","新":"新","款":"款",
    "泡":"泡","茶":"茶","具":"具","套":"套","正":"正","宗":"宗","宜":"宜","兴":"興",
    "原":"原","矿":"礦","紫":"紫","泥":"泥","家":"家","用":"用","名":"名","大":"大",
    "容":"容","量":"量","描":"描","金":"金","杯":"杯","礼":"禮","盒":"盒","企":"企",
    "业":"業","定":"定","制":"製","戴":"戴","晨":"晨","光":"光","老":"老","百":"百",
    "年":"年","利":"利","永":"永","底":"底","槽":"槽","青":"青","颐":"頤","春":"春",
    "一":"一","二":"二","三":"三","四":"四","五":"五","六":"六","七":"七","八":"八",
    "九":"九","十":"十","约":"約","单":"單","彩":"彩","绘":"繪","刻":"刻","素":"素",
    "颜":"顏","络":"絡","链":"鏈","接":"接","评":"評","价":"價","销":"銷","售":"售",
    "商":"商","品":"品","户":"戶","账":"賬","电":"電","话":"話","地":"地","址":"址",
    "购":"購","买":"買","车":"車","结":"結","算":"算","支":"支","付":"付","宝":"寶",
    "信":"信","收":"收","货":"貨","注":"註","册":"冊","登":"登","录":"錄","关":"關",
    "于":"於","我":"我","们":"們","设":"設","置":"置","语":"語","言":"言","订":"訂",
    "历":"歷","史":"史","藏":"藏","退":"退","出":"出","帮":"幫","助":"助","客":"客",
    "服":"服","法":"法",
}

SHAPE_KEYWORDS = {
    "石瓢": "石瓢壶", "西施": "西施壶", "仿古": "仿古壶", "汉瓦": "汉瓦壶",
    "归兽": "归兽壶", "如意": "西施壶", "祥龙": "仿古壶",
}

CATEGORY_KEYWORDS = {
    "壶": "teapot", "杯": "cup", "茶宠": "teaPet", "工具": "teaTool", "礼盒": "gift",
}

def to_zh_tw(text: str) -> str:
    """简体中文 → 繁体中文"""
    return "".join(ZH_TW_MAP.get(ch, ch) for ch in text)

def pinyinify(text: str) -> str:
    """生成 slug（拼音转写）"""
    py_map = {
        "宜":"yi","兴":"xing","紫":"zi","砂":"sha","壶":"hu","纯":"chun","手":"shou",
        "工":"gong","夫":"fu","茶":"cha","具":"ju","套":"tao","装":"zhuang","归":"gui",
        "兽":"shou","石":"shi","瓢":"piao","西":"xi","施":"shi","仿":"fang","古":"gu",
        "汉":"han","瓦":"wa","如":"ru","意":"yi","新":"xin","款":"kuan","泡":"pao",
        "正":"zheng","宗":"zong","原":"yuan","矿":"kuang","泥":"ni","家":"jia","用":"yong",
        "名":"ming","大":"da","容":"rong","量":"liang","描":"miao","金":"jin","杯":"bei",
        "礼":"li","盒":"he","企":"qi","业":"ye","定":"ding","戴":"dai","晨":"chen",
        "光":"guang","老":"lao","百":"bai","年":"nian","利":"li","永":"yong","底":"di",
        "槽":"cao","青":"qing","颐":"yi","春":"chun",
        "一":"1","二":"2","三":"3","四":"4","五":"5","六":"6","七":"7","八":"8","九":"9","十":"10","零":"0",
    }
    slug = ""
    for ch in text.lower():
        if ch in py_map:
            slug += py_map[ch]
        elif re.match(r"[a-z0-9\-_.]", ch):
            slug += ch
    if not slug or len(slug) < 4:
        h = abs(hash(text)) % (10**8)
        slug = f"pot-{h:08x}"
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or "teapot"

def detect_shape(title: str) -> str:
    """从标题识别壶型"""
    for kw, shape in SHAPE_KEYWORDS.items():
        if kw in title:
            return shape
    return ""

def detect_category(title: str) -> str:
    for kw, cat in CATEGORY_KEYWORDS.items():
        if kw in title:
            return cat
    return "teapot"

def find_product_folders(source_dirs=None) -> list:
    """扫描所有目录，找到带 页面数据.txt 的产品文件夹"""
    folders = set()
    dirs = source_dirs if source_dirs is not None else SOURCE_DIRS
    for d in dirs:
        if not os.path.isdir(d):
            print(f"[WARN] 目录不存在: {d}")
            continue
        # 检查目录本身是否是产品文件夹
        if os.path.isfile(os.path.join(d, "页面数据.txt")):
            folders.add(d)
            continue
        # 否则查找子目录
        try:
            for entry in os.listdir(d):
                fp = os.path.join(d, entry)
                if os.path.isdir(fp) and os.path.isfile(os.path.join(fp, "页面数据.txt")):
                    folders.add(fp)
        except PermissionError:
            pass
    return list(folders)

def parse_page_data(folder_path: str) -> dict:
    """解析 页面数据.txt 获取产品信息"""
    txt_path = os.path.join(folder_path, "页面数据.txt")
    if not os.path.isfile(txt_path):
        return None

    with open(txt_path, "r", encoding="utf-8-sig") as f:
        lines = [l.strip() for l in f if l.strip()]

    result = {"title": "", "sourceUrl": "", "price": 0, "itemId": "", "variants": [], "specs": {}}

    # 第一段非空非链接非标签行 = 标题
    for line in lines:
        if (line and not line.startswith("http") and not line.startswith("价格")
            and not line.startswith("销量") and not line.startswith("评论")
            and not line.startswith("商品Id") and not line.startswith("名称:")
            and not line.startswith("skuId:") and not line.startswith("买家")):
            result["title"] = line
            break
    if not result["title"]:
        result["title"] = os.path.basename(folder_path).lstrip("0123456789_").lstrip("0_")

    cv = None  # current variant
    for line in lines:
        if line.startswith("http") and not result["sourceUrl"]:
            result["sourceUrl"] = line
            continue
        if (line.startswith("价格：") or line.startswith("价格:")) and not result["price"]:
            m = re.search(r"[\d.]+", line)
            if m: result["price"] = float(m.group())
            continue
        if line.startswith("商品Id：") or line.startswith("商品Id:"):
            result["itemId"] = line.replace("商品Id：", "").replace("商品Id:", "").strip()
            continue
        if line.startswith("名称:") or line.startswith("名称："):
            name = line[3:].strip()
            if name and len(name) < 100 and not name.startswith("http") and name != result["title"]:
                if cv and cv["name"]:
                    result["variants"].append(cv)
                cv = {"name": name, "price": 0, "original_price": 0, "sku_id": ""}
            continue
        if cv:
            if line.startswith("skuId:") or line.startswith("skuId："):
                cv["sku_id"] = line.replace("skuId：", "").replace("skuId:", "").strip()
            elif line.startswith("价格:") or line.startswith("价格："):
                m = re.search(r"[\d.]+", line)
                if m: cv["price"] = float(m.group())
            elif line.startswith("优惠前:") or line.startswith("优惠前："):
                m = re.search(r"[\d.]+", line)
                if m: cv["original_price"] = float(m.group())
            elif line.startswith("券后价:") or line.startswith("券后价："):
                m = re.search(r"[\d.]+", line)
                if m and cv["price"] == 0: cv["price"] = float(m.group())

    if cv and cv["name"]:
        result["variants"].append(cv)
    if not result["price"] and result["variants"]:
        result["price"] = min(v["price"] or 999 for v in result["variants"])

    # 读 商品链接.txt 补充链接
    link_path = os.path.join(folder_path, "商品链接.txt")
    if not result["sourceUrl"] and os.path.isfile(link_path):
        with open(link_path, "r", encoding="utf-8") as f:
            result["sourceUrl"] = f.readline().strip()
    return result

def detect_images(folder_path: str, _variants=None) -> dict:
    """检测并分类文件夹中的图片/视频文件"""
    result = {
        "mainImages": [], "detailImages": [], "variantImages": {},
        "videos": [], "reviewImages": [], "detailLong": None,
    }
    if not os.path.isdir(folder_path):
        return result

    for fname in os.listdir(folder_path):
        ext = os.path.splitext(fname)[1].lower()
        base = os.path.splitext(fname)[0]

        if ext in (".mp4", ".mov", ".avi"):
            result["videos"].append(fname)
            continue
        if ext not in (".jpg", ".jpeg", ".png"):
            continue

        if fname.startswith("主图_"):
            result["mainImages"].append(fname)
        elif fname.startswith("详情_"):
            if re.match(r"^详情_1\.", fname):  # 跳过详情_1（与主图重复）
                continue
            result["detailImages"].append(fname)
        elif re.match(r"^detailLong\.", fname, re.I):
            result["detailLong"] = fname
        elif re.match(r"^\d+_.+\.(jpg|jpeg|png)$", fname, re.I):
            pre = int(base.split("_")[0])
            if 11 <= pre <= 99:
                result["variantImages"][fname] = True
        elif re.match(r"^\d+\.(jpg|jpeg|png)$", fname, re.I):
            result["reviewImages"].append(fname)

    def _num_sort(x):
        m = re.search(r"\d+", x)
        return int(m.group()) if m else 0

    result["mainImages"].sort(key=_num_sort)
    result["detailImages"].sort(key=_num_sort)
    # 详情图多于3张时去掉最后2张（可能无关）
    if len(result["detailImages"]) > 3:
        result["detailImages"] = result["detailImages"][:-2]

    return result

def match_variant_images(variant_images: dict, variants: list) -> dict:
    """将变量名图片映射到对应的 SKU"""
    matched = {}
    for fname in variant_images:
        name_part = os.path.splitext(fname)[0].split("_", 1)[-1].lower()
        best, best_score = None, 0
        num_m = re.match(r"^(\d+)_", fname)
        file_idx = int(num_m.group(1)) if num_m else 0
        for vi, v in enumerate(variants):
            vname = v["name"].lower()
            score = sum(1 for ch in name_part if ch in vname)
            if file_idx and (file_idx - 11) == vi:
                score += 10
            if score > best_score:
                best_score = score
                best = v
        if best:
            matched[best.get("sku_id") or best["name"]] = fname
    return matched

def get_uploaded_ids() -> list:
    """读取 source_products.json 中已上架的 ID 列表"""
    jp = r"F:\codex-yunxing\zishahu\data\source_products.json"
    if not os.path.isfile(jp):
        return []
    with open(jp, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [p["id"] for p in data.get("products", [])]


def set_source_dirs(dirs):
    global SOURCE_DIRS
    SOURCE_DIRS = [d.strip() for d in dirs if d.strip()]
    return SOURCE_DIRS


def set_source_dirs(dirs):
    global SOURCE_DIRS
    SOURCE_DIRS = [d.strip() for d in dirs if d.strip()]
    return SOURCE_DIRS
