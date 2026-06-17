# -*- coding: utf-8 -*-
import sys, os

# Write the process-all-products.js script
## We'll build it piece by piece to avoid shell escaping issues

# First part: the js file content as a Python list of lines
js_lines = []
js_lines.append("const fs = require('fs');")
js_lines.append("const path = require('path');")
js_lines.append("const XLSX = require('xlsx');")
js_lines.append("const TUKUAI_BASE = 'D:\\\\u56fe\\u5feb\\u4e0b\\u8f7d\\u5668\\\\u6dd8\\u5b9d\\u91c7\\u96c6';")
js_lines.append("")

# Write to file
with open('F:/codex-yunxing/zishahu/scripts/process-all-products.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(js_lines))
print('Part 1 written')
