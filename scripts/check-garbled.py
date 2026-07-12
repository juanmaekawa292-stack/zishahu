import ssl, urllib.request, re
ctx = ssl._create_unverified_context()
req = urllib.request.Request('https://zishapro.com/zh-CN/products/%E5%8F%A4%E6%82%A6%E5%A0%82%E5%AE%9C%E5%85%B4%E7%B4%AB%E7%A0%82%E5%A3%B6%E5%90%8D%E5%AE%B6%E5%85%A8%E6%89%8B%E5%B7%A5%E6%AD%A3%E5%93%81%E8%8C%B6%E5%A3%B6%E8%8C%B6%E5%85%B7%E5%A5%97%E8%A3%85%E5%9B%9B%E6%96%B9%E5%A3%B6%E7%BB%BF%E6%B3%A5%E7%9C%9F%E9%BE%99%E5%A3%B6', headers={'User-Agent':'Mozilla/5.0'})
resp = urllib.request.urlopen(req, context=ctx, timeout=10)
body = resp.read().decode('utf-8','replace')
garbled = body.count('\ufffd')
print(f'Garbled chars: {garbled}')
for term in ['紫砂雅集', '规格参数', '容量', '商品描述']:
    print(f'  "{term}": {body.count(term)} times')
idx = body.find('规格参数')
if idx > 0:
    print(f'\nAround 规格参数: ...{body[idx:idx+300]}...')
