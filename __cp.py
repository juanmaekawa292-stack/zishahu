import os
import json

target = r'F:\codex-yunxing\紫砂壶管理系统\templates\index.html'
os.makedirs(os.path.dirname(target), exist_ok=True)

# Read the old file and copy it to templates first
src = r'F:\codex-yunxing\紫砂壶管理系统\public\index.html'
with open(src, 'rb') as f:
    data = f.read()
with open(target, 'wb') as f:
    f.write(data)
print('Copied', len(data), 'bytes ok')