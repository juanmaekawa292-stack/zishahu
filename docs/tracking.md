# Tracking

## 2026-06-21 — 上架工具修复

### 修复
1. **store_writer.py 语法错误** — sync_source_json_from_products_ts() 结尾的 eturn 合并到了下一行
2. **新增 _extract_item_id** — 从淘宝URL提取商品数字ID用于去重
3. **库存筛选** — minStock 参数现在真正过滤SKU
4. **item_id 去重** — 上架前检查淘宝ID是否已存在
5. **source_products.json 新增 item_id 字段**
