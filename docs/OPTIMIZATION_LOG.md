# 优化记录与上架指南

## 已修复的问题

### 1. 详情页 404（中文 slug 编码问题）
**问题**：Next.js 16.2.9 Turbopack SSG 构建时，`generateStaticParams` 返回的中文 slug，传到 `params.slug` 时保留了 URL 编码形式（`%E5%8F%A4...`），而不是解码后的中文字符串。`getProductBySlug` 无法匹配到商品，触发 `notFound()`。

**修复**：在 `page.tsx` 中添加 `decodeURIComponent` 回退：
```tsx
var product = getProductBySlug(slug);
if (!product) {
  try {
    var decoded = decodeURIComponent(slug);
    product = getProductBySlug(decoded);
  } catch(e) {}
}
```

**文件**：`src/app/[locale]/products/[slug]/page.tsx`

### 2. 文件编码问题
**问题**：用 PowerShell 的 `Set-Content`（默认 ANSI 编码）写中文内容会导致 UTF-8 文件损坏。
**规则**：永远通过 Node.js REPL 的 `writeFileSync(..., 'utf8')` 写入含中文的文件。

### 3. 规格参数显示不全
**问题**：specLabelMap 中的字段排序和缺少 `mainImageSource`。
**修复**：更新 `specLabelMap` 按用户要求的11个字段排序，添加 `mainImageSource`。

## 规格字段对照表

| 序号 | xlsx SKU信息 spec 字段名 | products.ts specs key | 中文显示 |
|------|------------------------|----------------------|---------|
| 1 | 烧制窑型 | firingType | 烧制窑型 |
| 2 | 容量 | capacity | 容量 |
| 3 | 主图来源 | mainImageSource | 主图来源 |
| 4 | 产地 | origin | 产地 |
| 5 | 是否手工 | handmade | 是否手工 |
| 6 | 材质 | material | 材质 |
| 7 | 壶型 | shapeType | 壶型 |
| 8 | 包装形式 | packaging | 包装形式 |
| 9 | 窑系 | kiln | 窑系 |
| 10 | 年代/年份 | year | 年代/年份 |
| 11 | 颜色分类 | color | 颜色分类 |

**显示逻辑**：`Object.entries(product.specs).filter(([_, v]) => v && v.length > 0)` —— 有值就显示，无值自动隐藏。

## 修改过的文件清单

- `src/app/[locale]/products/[slug]/page.tsx` — 添加 decodeURIComponent 回退
- `src/components/product/ProductDetailContent.tsx` — 更新 specLabelMap
- `src/types/index.ts` — ProductSpecs 添加 mainImageSource
- `messages/zh-CN.json` — 添加 shapeType 翻译
- `messages/zh-TW.json` — 添加 shapeType 翻译

## 上架新商品时的步骤

1. **解析 xlsx** → 生成 products.ts 格式的 JSON
2. **specs 字段映射**：确保用上表的 key 名（firingType/capacity/origin 等）
3. **slug**：直接用中文商品名（不要手动编码，应用层会自动处理）
4. **构建测试**：`npm run build` 确认 304 SSG 页面生成
5. **本地验证**：`npm run dev -- -p 4001` 测试详情页
6. **部署**：`git commit && git push && npx vercel deploy --prod`

## 注意事项

- PS 的 `Set-Content` 默认 ANSI 编码，写入中文文件会损坏 —— 用 `writeFileSync` 或 VS Code 保存
- 图片路径格式：`https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/tk-xxx/main_1.webp`
- COS SecretKey 不要提交到 git 历史
