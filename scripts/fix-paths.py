# -*- coding: utf-8 -*-
import sys
content = open('F:/codex-yunxing/zishahu/scripts/template-node.js', 'r', encoding='utf-8').read()
# Replace the path placeholders with actual Chinese text
content = content.replace('__TUKUAI_BASE__', 'D:\\\u56fe\u5feb\u4e0b\u8f7d\u5668\\\u6dd8\u5b9d\u91c7\u96c6')
open('F:/codex-yunxing/zishahu/scripts/template-node.js', 'w', encoding='utf-8').write(content)
print('Done')