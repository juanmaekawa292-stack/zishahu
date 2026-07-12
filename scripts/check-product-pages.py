import ssl, urllib.request, re
ctx = ssl._create_unverified_context()
req = urllib.request.Request('https://zishapro.com/zh-CN/products', headers={'User-Agent':'Mozilla/5.0'})
resp = urllib.request.urlopen(req, context=ctx, timeout=10)
body = resp.read().decode('utf-8', errors='replace')
slugs = re.findall(r'/zh-CN/products/([^\"\']+)', body)
print(f'Found {len(slugs)} product slugs')
tested = 0
for slug in slugs:
    url = f'https://zishapro.com/zh-CN/products/{slug}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, context=ctx, timeout=10)
        page = resp.read().decode('utf-8', errors='replace')
        garbled = page.count('\ufffd')
        if '商品未找到' in page or 'Product not found' in page:
            print(f'  [404] ...{slug[-15:]}')
        elif garbled > 0:
            print(f'  [GARBLED {garbled}] ...{slug[-15:]}')
        else:
            print(f'  [OK] ...{slug[-15:]}')
        tested += 1
        if tested >= 20:
            break
    except Exception as e:
        print(f'  [ERR] ...{slug[-15:]} -> {e}')
print(f'Tested {tested} products')
