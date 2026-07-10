import re
import sys

if len(sys.argv) < 2:
    print("Usage: python _scripts/insert_entry.py <entry_filename>")
    sys.exit(1)

entry_filename = sys.argv[1]

with open('src/data/blog.ts', encoding='utf-8') as f:
    c = f.read()

with open(entry_filename, encoding='utf-8') as f:
    entry = f.read()

insert_pos = c.rfind('\n ];')
new = c[:insert_pos] + entry + c[insert_pos:]

with open('src/data/blog.ts', 'w', encoding='utf-8') as f:
    f.write(new)

print(f"Inserted {len(entry)} chars at position {insert_pos}")
print(f"Entry file: {entry_filename}")
print(f"Total file: {len(new)} chars")
