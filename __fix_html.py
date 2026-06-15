import os, re

old_path = r'F:\codex-yunxing\紫砂壶管理系统\public\index.html'
target_path = r'F:\codex-yunxing\紫砂壶管理系统\templates\index.html'

# Read the old file
with open(old_path, 'rb') as f:
    raw = f.read()

# The old file has corrupted Chinese characters in UTF-8.
# We need to write a completely new clean file.
# Let's extract the structure from the old file and write clean content.

# Actually, let's just read the old HTML, fix encoding by re-decoding,
# but the Chinese characters are already lost. Let's rebuild from scratch.

# Read old file as-is, decode as latin1 to preserve byte structure
content = raw.decode('latin-1')

# Replace garbled Chinese text markers with clear Chinese
replacements = {
    '绱爞澹?': '紫砂壶',
    '鍟嗗搧涓婃灦宸ュ叿': '商品上架工具',
    '妫€鏌ヤ腑...': '检查中...',
    '馃珫': '',
    '馃攧': '',
    '馃搵': '',
    '馃摲': '',
    '馃幀': '',
    '馃敆': '',
    '馃彿': '',
    '馃搧': '',
    '馃搳': '',
    '椤圭洰': '',
    '褰撳墠': '',
    '蹇欑': '',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Replace known garbled Chinese patterns with clean text
# The old file is encoded wrong - the bytes are correct but displayed as wrong chars.
# Let's take a different approach - write completely fresh content.

# Actually, the structure and JS CSS are fine in the old file, just Chinese text is garbled.
# Let me just copy the old file as-is to templates/ and then fix only the visible text.

with open(target_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Copied {len(content)} bytes to {target_path}')
