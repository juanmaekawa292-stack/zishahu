with open("store_writer.py", "r", encoding="utf-8") as f:
    content = f.read()
old = '    return data["products"]def get_current_product_ids():'
new = 'def get_current_product_ids():'
content = content.replace(old, new)
with open("store_writer.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed")
import ast
ast.parse(content)
print("Syntax OK")
