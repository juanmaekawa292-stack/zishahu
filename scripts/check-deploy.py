import ssl, urllib.request
ctx = ssl._create_unverified_context()
req = urllib.request.Request('https://zishapro.com', headers={'User-Agent':'Mozilla/5.0'})
resp = urllib.request.urlopen(req, context=ctx, timeout=10)
body = resp.read().decode('utf-8','replace')
print(f'Status={resp.status} Size={len(body)}')
print(f'GA={"G-OFB70RY8C6" in body}')
print(f'fbq={"fbq" in body}')
print(f'TITLE={"紫砂雅集" in body}')
