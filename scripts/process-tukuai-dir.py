#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Process product data from Tukuai downloader folders into products.ts"""

import os, re, math, random, json, shutil

SRC = r'D:\鍥惧揩涓嬭浇鍣╘娣樺疂閲囬泦'
IMG = r'F:\codex-yunxing\zishahu\public\images\products'
OUT = r'F:\codex-yunxing\zishahu\src\data\products.ts'

COEFF = 10
FX = 7.25
MIN_RMB = 150


def calc_price(rmb):
    raw = (rmb * COEFF) / FX
    bs = [(0, 100, 19, 39), (100, 300, 39, 79), (300, 800, 79, 169),
          (800, 2000, 169, 399), (2000, 1e9, 399, 999)]
    fp = round(raw)
    for a, b, c, d in bs:
        if a <= rmb < b:
            fp = max(c, min(d, fp))
            break
    fp = int(fp / 10) * 10 + 9
    if fp < 5:
        fp = round(raw)
    return fp, round(fp * (1.2 + random.random() * 0.3))


def parse(fpath):
    with open(fpath, 'r', encoding='utf-8-sig') as f:
        text = f.read()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    title = lines[0] if lines else ''
    item_id = ''
    for l in lines:
        m = re.search(r'鍟嗗搧[Ii]d[锛?]\s*(\d+)', l)
        if m:
            item_id = m.group(1)
    skus = []
    i = 0
    while i < len(lines):
        if lines[i].startswith('\u540d\u79f0:'):
            name = lines[i].split(':', 1)[-1].strip()
            i += 1
            sku = {'name': name, 'skuId': '', 'price': 0, 'orig': 0, 'img': ''}
            while i < len(lines) and not lines[i].startswith('\u540d\u79f0:'):
                if 'skuId' in lines[i] and ':' in lines[i]:
                    sku['skuId'] = lines[i].split(':', 1)[-1].strip()
                elif lines[i].startswith('\u4ef7\u683c:') and ':' in lines[i]:
                    p = lines[i].split(':', 1)[-1].strip()
                    if p.isdigit():
                        sku['price'] = int(p)
                elif lines[i].startswith('\u4f18\u60e0\u524d:') and ':' in lines[i]:
                    p = lines[i].split(':', 1)[-1].strip()
                    if p.isdigit():
                        sku['orig'] = int(p)
                elif '\u56fe\u7247\u94fe\u63a5' in lines[i] and ':' in lines[i]:
                    sku['img'] = lines[i].split(':', 1)[-1].strip()
                i += 1
            skus.append(sku)
        else:
            i += 1
    main_imgs = []
    for l in lines:
        if '\u4e3b\u56fe\u5730\u5740' in l:
            parts = l.split(':', 1)
            if len(parts) > 1:
                main_imgs = [x.strip() for x in parts[1].split(';') if x.strip()]
            break
    video = ''
    for l in lines:
        if '\u89c6\u9891\u5b58\u653e\u5730\u5740' in l and ':' in l:
            video = l.split(':', 1)[-1].strip()
    source_url = ''
    for l in lines:
        if 'item.taobao.com' in l or 'detail.tmall.com' in l:
            source_url = l
            break
    return {'title': title, 'item_id': item_id, 'skus': skus,
            'main_images': main_imgs, 'video': video, 'source_url': source_url}


def mk_desc(title, skus):
    sk = '\n'.join([f'  - {s["name"]}锛埪s["orig"] or s["price"]}锛? for s in skus])
    return (r'銆屼汉闂寸彔鐜夊畨瓒冲彇锛屽矀濡傞槼缇℃邯澶翠竴涓稿湡銆嶁€斺€?瀹滃叴绱爞锛屽崈骞翠紶鎵跨殑鑼堕亾涔嬮瓊銆? + '\n\n'
            f'**{title}**\n\n'
            r'### 浜у搧浜偣' + '\n'
            r'浼犳壙缁忓吀鍣ㄥ瀷锛岀簿閫変紭璐ㄦ偿鏂欙紝鐢辩粡楠屼赴瀵岀殑鍖犱汉鎵嬪伐鍒朵綔銆傛瘡涓€澶勭粏鑺傞兘缁忚繃鍙嶅鎵撶（锛屽彧涓哄憟鐜版渶绾鐨勭传鐮備箣缇庛€? + '\n\n'
            r'### 鍙€夎鏍? + '\n'
            f'{sk}\n\n'
            r'### 閫傜敤鍦烘櫙' + '\n'
            r'- 鏃ュ父鍝佽寳锛氫笌涓変簲濂藉弸鍏卞搧涓€澹跺ソ鑼? + '\n'
            r'- 鑼跺腑闆呴泦锛氫负鎮ㄧ殑鑼跺腑澧炴坊涓€浠戒笢鏂圭編瀛? + '\n'
            r'- 绀艰禒浜插弸锛氱簿缇庡寘瑁咃紝浼犻€掑績鎰忎笌鍝佸懗' + '\n'
            r'- 涓汉鏀惰棌锛氬尃浜烘墜浣滐紝姣忎竴鎶婇兘鏄嫭涓€鏃犱簩鐨勮壓鏈搧' + '\n\n'
            r'### 鍏绘姢灏忚创澹? + '\n'
            r'1. 鏂板６浣跨敤鍓嶏紝寤鸿鐢ㄨ尪姘寸叜娌?0鍒嗛挓浠ャ€屽紑澹躲€? + '\n'
            r'2. 浣跨敤鍚庡強鏃舵竻娲楋紝淇濇寔澹跺唴骞茬埥' + '\n'
            r'3. 涓€澹朵竴鑼讹紝璁╃传鐮傚厖鍒嗗惛闄勮尪棣欙紝鏃ヤ箙鐢熼' + '\n'
            r'4. 閬垮厤纾曠锛屽瓨鏀句簬閫氶骞茬嚗澶? + '\n\n'
            r'姣忎欢鍟嗗搧鍧囬檮璧犵簿缇庣ぜ鐩掑寘瑁咃紝鏄嚜鐢ㄦ敹钘忎笌棣堣禒浜插弸鐨勪笂浣充箣閫夈€?)


SC2TC = str.maketrans({
    '浜?: '鐢?,
    '鐐?: '榛?,
    '浼?: '鍎?,
    '楠?: '椹?,
    '鍒?: '瑁?,
    '澶?: '铏?,
    '缁?: '绱?,
    '鑺?: '绡€',
    '澶?: '瑕?,
    '鐜?: '鐝?,
    '绾?: '绱?,
    '閫?: '閬?,
    '瑙?: '瑕?,
    '閫?: '閬?,
    '鍦?: '鍫?,
    '涓?: '鏉?,
    '瀛?: '瀛?,
    '绀?: '绂?,
    '璧?: '璐?,
    '浜?: '瑕?,
    '浼?: '鍌?,
 '閫?: '閬?,
    '涓?: '鍊?,
    '鐙?: '鐛?,
    '鏃?: '鐒?,
    '鑹?: '钘?,
    '鏈?: '琛?,
    '鍏?: '椁?,
    '鎶?: '璀?,
    '璐?: '璨?,
    '寮€': '闁?,
    '鏃?: '鏅?,
    '骞?: '涔?,
    '澹?: '澹?,
    '椋?: '棰?,
    '棣?: '楗?,
    '涔?: '缇?,
    '濡?: '濡?,
    '棰?: '椤?,
    '缁?: '绻?,
    '涓?: '楹?,
    '鑹?: '璞?,
    '涓?: '鍙?,
})


def to_tc(text):
    return text.translate(SC2TC)


SHIPIAO_IMG = {
    '\u4e3b\u56fe_1.jpg': 'shipiao-main-1.jpg',
    '\u4e3b\u56fe_2.jpg': 'shipiao-main-2.jpg',
    '\u4e3b\u56fe_3.jpg': 'shipiao-main-3.jpg',
    '\u4e3b\u56fe_4.jpg': 'shipiao-main-4.jpg',
    '\u4e3b\u56fe_5.jpg': 'shipiao-main-5.jpg',
    '11_\u5f69\u7ed8\u6b3e\u5355\u58f6 \u7ea6240ml\u3010\u4ee5\u6b64\u4e3a\u51c6\u3011.jpg': 'shipiao-caihui-danhu.jpg',
    '12_\u523b\u7ed8\u6b3e\u5355\u58f6 \u7ea6240ml\u3010\u4ee5\u6b64\u4e3a\u51c6\u3011.jpg': 'shipiao-kehui-danhu.jpg',
    '13_\u7d20\u989c\u6b3e\u5355\u58f6 \u7ea6240ml\u3010\u4ee5\u6b64\u4e3a\u51c6\u3011.jpg': 'shipiao-suyan-danhu.jpg',
    '14_\u5f69\u7ed8\u6b3e\u5927\u5957\u88c5 \u7ea6240ml\u3010\u4ee5\u6b64\u4e3a\u51c6\u3011.jpg': 'shipiao-caihui-set.jpg',
    '15_\u523b\u7ed8\u6b3e\u5927\u5957\u88c5 \u7ea6240ml\u3010\u4ee5\u6b64\u4e3a\u51c6\u3011.jpg': 'shipiao-kehui-set.jpg',
    '16_\u7d20\u989c\u6b3e\u5927\u5957\u88c5 \u7ea6240ml\u3010\u4ee5\u6b64\u4e3a\u51c6\u3011.jpg': 'shipiao-suyan-set.jpg',
}

GUISHOU_IMG = {
    '\u4e3b\u56fe_1.jpg': 'guishou-main-1.jpg',
    '\u4e3b\u56fe_2.jpg': 'guishou-main-2.jpg',
    '\u4e3b\u56fe_3.jpg': 'guishou-main-3.jpg',
    '11_\u5355\u58f6.jpg': 'guishou-danhu.jpg',
    '12_\u4e00\u58f6\u56db\u676f.jpg': 'guishou-1hu4bei.jpg',
    '13_\u4e00\u58f6\u516d\u676f.jpg': 'guishou-1hu6bei.jpg',
}


def js_str(s):
    return json.dumps(s, ensure_ascii=False)


def js_arr(arr):
    return '[' + ','.join(js_str(x) for x in arr) + ']'


def main():
    products = []
    pid = 0
    for folder in sorted(os.listdir(SRC)):
        fp = os.path.join(SRC, folder)
        if not os.path.isdir(fp):
            continue
        txt = os.path.join(fp, '\u9875\u9762\u6570\u636e.txt')
        if not os.path.exists(txt):
            continue
        print(f'--- {folder} ---')
        d = parse(txt)
        print(f'Title: {d["title"][:40]}...')
        print(f'Item: {d["item_id"]}, SKUs: {len(d["skus"])}')
        base_p = 0
        for s in d['skus']:
            p = s['orig'] or s['price']
            if p > 0 and (base_p == 0 or p < base_p):
                base_p = p
        if base_p == 0 and d['skus']:
            base_p = d['skus'][0]['price']
        print(f'Base: 楼{base_p}')
        if base_p < MIN_RMB:
            print(f'SKIP (< 楼{MIN_RMB})')
            continue
        price, orig_price = calc_price(base_p)
        print(f'Price: 楼{base_p} -> ${price} USD')
        is_sp = '\u77f3\u74e2' in d['title']
        prod_id = 'tk-001' if pid == 0 else 'tk-002'
        key = 'shipiao' if is_sp else 'guishou'
        img_map = SHIPIAO_IMG if is_sp else GUISHOU_IMG
        imgs = []
        os.makedirs(IMG, exist_ok=True)
        for srcn, dstn in img_map.items():
            sp = os.path.join(fp, srcn)
            dp = os.path.join(IMG, dstn)
            if os.path.exists(sp):
                if not os.path.exists(dp) or os.path.getsize(dp) != os.path.getsize(sp):
                    shutil.copy2(sp, dp)
                    print(f'  img: {dstn}')
                imgs.append(f'/images/products/{dstn}')
        videos = []
        if d['video'] and os.path.exists(d['video']):
            vdir = r'F:\codex-yunxing\zishahu\public\videos\products'
            os.makedirs(vdir, exist_ok=True)
            vdst = os.path.join(vdir, f'{key}-1.mp4')
            if not os.path.exists(vdst):
                shutil.copy2(d['video'], vdst)
                print(f'  video: {key}-1.mp4')
            videos.append(f'/videos/products/{key}-1.mp4')
        desc_tc = to_tc(mk_desc(d['title'], d['skus']))
        title_tc = to_tc(d['title'])
        prod = {
            'id': prod_id,
            'slug': d['title'],
            'title_zhCN': d['title'],
            'title_zhTW': title_tc,
            'description_zhCN': mk_desc(d['title'], d['skus']),
            'description_zhTW': desc_tc,
            'price': price,
            'originalPrice': orig_price,
            'images': imgs,
            'category': 'teapot',
            'inStock': True,
            'stock': 100,
            'featured': pid == 0,
            'specs': {'capacity': '', 'clay': '', 'craft': '\u624b\u5de5\u5236\u4f5c', 'dimensions': ''},
            'createdAt': '2026-06-14',
            'rating': 4.8,
            'reviewCount': 0,
            'sourceUrl': d.get('source_url', ''),
            'sourceSku': d.get('item_id', ''),
            'videos': videos,
        }
        products.append(prod)
        pid += 1
        print(f'  \u2713 {prod_id}')
        print()

    # Generate TS file
    lines = ['import { Product } from "@/types";', '',
             'export const products: Product[] = [']
    for i, p in enumerate(products):
        sep = ',' if i < len(products) - 1 else ''
        lines.append(f'''  {{
    id: {js_str(p['id'])},
    slug: {js_str(p['slug'])},
    title_zhCN: {js_str(p['title_zhCN'])},
    title_zhTW: {js_str(p['title_zhTW'])},
    description_zhCN: {js_str(p['description_zhCN'])},
    description_zhTW: {js_str(p['description_zhTW'])},
    price: {p['price']},
    originalPrice: {p['originalPrice']},
    images: {js_arr(p['images'])},
    category: {js_str(p['category'])},
    inStock: {str(p['inStock']).lower()},
    stock: {p['stock']},
    featured: {str(p['featured']).lower()},
    specs: {{"capacity":{js_str(p['specs']['capacity'])},"clay":{js_str(p['specs']['clay'])},"craft":{js_str(p['specs']['craft'])},"dimensions":{js_str(p['specs']['dimensions'])}}},
    createdAt: {js_str(p['createdAt'])},
    rating: {p['rating']},
    reviewCount: {p['reviewCount']},
    sourceUrl: {js_str(p['sourceUrl'])},
    sourceSku: {js_str(p['sourceSku'])},
    videos: {js_arr(p['videos'])},
  }}{sep}''')
    lines.append('];')
    lines += ['', 'export const categories = [',
              '  { key: "all", label_zhCN: "\u5168\u90e8" },',
              '  { key: "teapot", label_zhCN: "\u7d2b\u7802\u58f6" },',
              '  { key: "cup", label_zhCN: "\u8336\u676f" },',
              '  { key: "teaPet", label_zhCN: "\u8336\u5ba0" },',
              '  { key: "teaTool", label_zhCN: "\u8336\u5177\u914d\u4ef6" },',
              '  { key: "gift", label_zhCN: "\u793c\u54c1\u5957\u88c5" },',
              '];', '',
              'export function getProductBySlug(slug: string) {',
              '  return products.find(function(p) { return p.slug === slug; });',
              '}', '',
              'export const countries = [',
              '  { code: "US", name_zhCN: "\u7f8e\u56fd", name_zhTW: "\u7f8e\u570b" },',
              '  { code: "CA", name_zhCN: "\u52a0\u62ff\u5927", name_zhTW: "\u52a0\u62ff\u5927" },',
              '  { code: "GB", name_zhCN: "\u82f1\u56fd", name_zhTW: "\u82f1\u570b" },',
              '  { code: "AU", name_zhCN: "\u6fb3\u5927\u5229\u4e9a", name_zhTW: "\u6fb3\u5927\u5229\u4e9e" },',
              '  { code: "SG", name_zhCN: "\u65b0\u52a0\u5761", name_zhTW: "\u65b0\u52a0\u5761" },',
              '  { code: "MY", name_zhCN: "\u9a6c\u6765\u897f\u4e9a", name_zhTW: "\u99ac\u4f86\u897f\u4e9e" },',
              '  { code: "TW", name_zhCN: "\u53f0\u6e7e", name_zhTW: "\u53f0\u7063" },',
              '  { code: "HK", name_zhCN: "\u9999\u6e2f", name_zhTW: "\u9999\u6e2f" },',
              '  { code: "DE", name_zhCN: "\u5fb7\u56fd", name_zhTW: "\u5fb7\u570b" },',
              '  { code: "FR", name_zhCN: "\u6cd5\u56fd", name_zhTW: "\u6cd5\u570b" },',
              '  { code: "JP", name_zhCN: "\u65e5\u672c", name_zhTW: "\u65e5\u672c" },',
              '  { code: "KR", name_zhCN: "\u97e9\u56fd", name_zhTW: "\u97d3\u570b" },',
              '];']

    result = '\n'.join(lines)
    with open(OUT, 'w', encoding='utf-8-sig') as f:
        f.write(result)
    print(f'--- products.ts updated ---')
    print(f'Products: {len(products)}')
    for p in products:
        print(f'  {p["id"]}: {p["title_zhCN"][:30]}... ${p["price"]} ({len(p["images"])} imgs)')


if __name__ == '__main__':
    main()
