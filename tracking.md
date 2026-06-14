# 商品运营上架 - 工作跟踪

## 2026-06-15
### 水印去除增强 + 重新上架
- **发现**：旧版 process-images.js 只覆盖了底右（天猫logo），底左（古悦堂品牌名）未覆盖
- **修复**：增强去水印逻辑，用 full white + opacity 1 覆盖底部左右两个区域（各 300×70px）
- **注意**：实际测试发现 `fit:cover center` 裁剪本身已切掉水印区域（750×1000 → 1200×1200，底部200px被切除），但添加 overlay 作为额外保障

### 商品数据更新
- **清空旧数据**：删除了旧的 products.ts 数据 + 旧的 17 张 WebP 图
- **从 D:\图快下载器\淘宝采集 重导入 2 个商品**：
  - **tk-001 归兽壶**：¥199 → $269 (10x定价)，6张图，featured: true
  - **tk-002 石瓢壶**：¥176 → $239 (10x定价)，11张图，featured: true（两个都featured）
- **定价**：采集价 × 10 ÷ 7.3 (USD汇率)，取整
- **描述**：两个商品都加了紫砂壶文化故事描述（简繁双版本）
- **源链接映射**：保留 sourceUrl、sourceSku

### 图片处理
- 17张 WebP 全部重新处理（无天猫/古悦堂水印）
- 1200×1200px, WebP, Q85
- 存放于 public/images/products/

### 验证结果
- http://localhost:4000/zh-CN/products 正常渲染
- 归兽壶 $269 和 石瓢壶 $239 价格显示正确
- 图片 HTTP 200 正常加载
- 石瓢壶视频未处理（留空）

### 待办
- 确认定价是否合适（10x 是否过高/过低）
- 石瓢壶视频处理方案待完善


## 2026-06-15 — Tmall-style 详情页改造

### 完成的工作
1. **商品数据扩展** (src/data/products.ts)
   - 新增 detailImages 字段：tk-002 石瓢壶 24 张详情图
   - 新增 variants 字段：归兽壶3种规格 / 石瓢壶6种规格
   - 添加 tk-002 视频路径 / 更新图片路径为子目录高清 JPG

2. **ProductDetailContent 重写** (src/components/product/ProductDetailContent.tsx)
   - 天猫风格轮播：纯白背景 + 视频首屏 + 箭头 + 圆点 + 缩略图
   - 规格选择器：分组展示，选中后价格/图片联动
   - 详情图区：商品底部全宽详情图瀑布流
   - 触屏滑动支持 / 规格购物车复合ID

3. **IP 语言检测** (src/proxy.ts)
   - 台湾/香港/澳门 IP → zh-TW，其他 → Accept-Language

4. **构建验证** — npm run build 零错误通过

### 待办
- zishapro.com DNS 仍未正确指向 Vercel（当前 198.18.1.56）
- 等待 Thread 2 采集完成后接入更多商品

## 2026-06-15 — Bug 修复 & 功能增强

### 修复的问题
1. **generateStaticParams 使用 p.id 导致 slug 路由冲突**
   - 修改 src/app/[locale]/products/[slug]/page.tsx：generateStaticParams 改为 p.slug
   - 同时 ProductCard 链接改为 product.slug，cart 页也同步
   - 改用 getProductBySlug 替代 getProductById
   - 构建后 URL 从 /zh-CN/products/tk-001 变为 /zh-CN/products/guishou-zisha-pot

2. **商品列表页 shape 过滤不生效**
   - ilteredProducts useMemo 没有使用 currentShape
   - 添加 shape 过滤条件并在依赖数组加入 currentShape

3. **ProductCard 加购按钮导致导航**
   - 按钮在 Link 内部，点击后触发页面跳转而非加购
   - 添加 e.stopPropagation() 阻止事件冒泡

### 验证
- npm run build 零错误通过 ✅
- 本地 dev server 验证：首页、商品列表、详情页、购物车、结账页面均 200 ✅
- 商品详情页已预渲染 /zh-CN/products/guishou-zisha-pot 等 4 个 URL ✅
- IP 语言检测 middleware 已就绪（src/proxy.ts）✅

### 待办
- zishapro.com DNS 待配置
- 等待 Thread 2 采集更多商品


## 2026-06-15 — Bug 修复 & 功能验证

### 修复的问题
1. **ProductCard 加购按钮缺少 stopPropagation**
   - 底部 "加入购物车" 按钮位于 Link 内部，点击会触发导航而非加购
   - 添加 e.stopPropagation()，Heart 按钮也移除错误 addItem 调用

2. **视频路径错误**
   - products.ts 中视频路径为 /videos/products/tk-002.mp4
   - 实际文件位于 /images/videos/tk-002/main.mp4
   - 已修正路径指向正确文件

3. **Heart 按钮行为错误**
   - Heart 按钮调用 addItem(product) 加购到购物车，错误
   - 改为 TODO 占位（待实现收藏夹功能）

### 验证结果
- ✅ npm run build 零错误 (Next.js 16.2.9, Turbopack)
- ✅ 所有 64 个页面成功预渲染 (zh-CN + zh-TW)
- ✅ 首页：商品展示、价格、加购按钮正常
- ✅ 商品详情页：轮播图、规格选择器、23张详情图正常
- ✅ 购物车：添加商品、变体支持正常工作
- ✅ 变体选择 + 加购联动正确

### 待办
- zishapro.com DNS 待配置
- 等待 Thread 2 采集更多商品
- 收藏夹功能待实现（Heart 按钮已预留位置）
