import re
with open('F:/codex-yunxing/zishahu/src/data/products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the actual structure around a sourceUrl
idx = content.find('"sourceUrl"')
# Go back to find the id
before = content[:idx]
id_idx = before.rfind('"id": "tk-')
print('Preceding id at:', id_idx)
print('Section:', repr(content[id_idx:idx+80]))

# The issue might be that the regex is too greedy between entries
# Let me use non-greedy and try on a broader sample
target = content[id_idx:idx+100]
entries = re.findall(r'"id":\s*"([^"]+)"', target)
print('IDs found:', entries[:3])

# Check the distance
print('Distance:', idx - id_idx)
