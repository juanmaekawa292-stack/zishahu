import re
with open('F:/codex-yunxing/zishahu/src/data/products.ts', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find('"sourceUrl"')
print('First sourceUrl at:', idx)
count = content.count('"id": "tk-')
print('Total ids:', count)
print('Total sourceUrl:', content.count('"sourceUrl"'))
# Check regex on small sample
sample = content[:idx+100]
entries = re.findall(r'"id":\s*"([^"]+)".*?"slug":\s*"([^"]+)".*?"title_zhCN":\s*"([^"]+)".*?"sourceUrl":\s*"([^"]*)"', sample, re.DOTALL)
print('Entries in sample:', len(entries))
if entries:
    print('First entry:', entries[0][:2])
