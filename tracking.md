# Zisha Product Collection System - Work Log

## 2026-06-12
### Completed
- [x] Built Playwright collection framework
  - Core modules: types.ts, browser.ts (anti-detection), utils.ts (helpers)
  - tmall-scraper.ts (search + detail parsing + SKU/image extraction)
  - output.ts (JSON/CSV output, incremental index management)
  - index.ts (entry point, CLI args, incremental, CSV export)
- [x] Installed Playwright + Chromium driver
- [x] Created output directory data/raw_products/
- [x] Tested Taobao/Tmall search page access
- [x] Login helper (login-helper.ts) created
- [x] Cookie-based scraper (cookie-scraper.ts) created

### Anti-scraping test results
- Search page (s.taobao.com) loads fine, no captcha block
- Product list data does NOT render - key findings:
  - API calls go through h5api.m.taobao.com (MTOP gateway)
  - Product search API (mtop.taobao.search) is blocked (sufeiPunish)
  - Login iframe initiates captcha (nc_1_nocaptcha slider)
  - g_page_config JSON data not present in page
- Mobile site (m.taobao.com) redirects to error page
- Individual product detail pages also redirect to login without cookies
- Conclusion: direct headless access is blocked. Login + cookie required.

### Working strategy
- Phase 1: Run login-helper.ts (opens browser, user logs in manually)
- Phase 2: Cookie state saved to data/raw_products/.taobao_cookies_state.json
- Phase 3: cookie-scraper.ts loads cookies and can access both search + detail

### Errors/Lessons
- [x] FrameLocator.evaluate does not exist in Playwright -> use page.frames()
- [x] loadCollectedIds was in wrong file -> fixed import
- [x] Tmall ban headless search via sufeiPunish system -> need cookies
- [x] Tmall redirects non-logged-in users to login -> cookie required
- [x] String special characters in patch cause mismatches -> use ASCII-only

## Pending
- [ ] User needs to run login-helper.ts once to establish session
- [ ] Test cookie-based collection with a real product
- [ ] Detail page parsing with logged-in session
- [ ] Map collected data to src/data/products.ts Product type
- [ ] Add proxy pool support for IP rate limiting

## Available Commands
```
npm run taobao:login        # Login helper (headed browser, manual login)
npm run taobao:scrape       # Cookie-based collection
npm run collect             # Original headless scraper (limited)
npm run collect:single      # Single product via original scraper
```

---
*Recorded by: Codex Collection Department*


---

# 营销部门工作记录

## 2026-06-12
### 已完成（第一阶段）
- [x] 创建 assets/marketing/ 目录结构（images/videos/articles/ads/keywords/social/scripts）
- [x] 创建 keywords.md — 50个关键词（4个意图分类）
- [x] 创建 content_plan.md — 10篇文章选题 + 5个短视频脚本
- [x] 创建 social/profiles.md — 品牌命名和5个社媒平台账号方案
- [x] SEO 基础设施：layout metadata、product metadata、robots.ts、sitemap.ts
- [x] 创建博客系统：blog/page.tsx、blog/[slug]/page.tsx
- [x] 添加 JSON-LD Article Schema 到博客详情页
- [x] 添加博客链接到 Header 导航（含 i18n 翻译）
- [x] 将博客页面添加到 sitemap.ts（含 zh-TW 替代链接）
- [x] 编写全部10篇博客文章（4篇原有 + 6篇新增）

### 新增6篇博客文章
| # | 标题 | 分类 | slug |
|---|------|------|------|
| 5 | 新手必看：如何选择人生第一把紫砂壶 | knowledge | how-to-choose-first-zisha-teapot |
| 6 | 一壶一茶：紫砂壶和不同茶类的搭配指南 | knowledge | zisha-teapot-tea-pairing-guide |
| 7 | 宜兴紫砂壶的历史：六百年窑火传承 | culture | yixing-zisha-history |
| 8 | 紫砂壶经典壶型大全：西施、石瓢、仿古等 | knowledge | classic-zisha-teapot-shapes |
| 9 | 海外华人购买紫砂壶指南：如何识别正品 | knowledge | buy-yixing-teapot-overseas-guide |
| 10 | 紫砂壶的升值空间：收藏级紫砂壶入门 | culture | zisha-teapot-collection-guide |

### 构建验证
- [x] Next.js 构建成功（0 error, 0 warning）
- [x] 12个博客页面全部静态预渲染
- [x] Sitemap 包含 20 个博客条目（10篇 x 2个语言版本）
- [x] Dev server 验证通过（/blog 200, /blog/[slug] 200）

### 社媒账号准备
- [x] 创建 social/account_setup_guide.md — 5个平台的详细注册指南
- [ ] 需要用户提供邮箱/手机号以完成账号注册验证
- [ ] Pinterest Business：注册页面已就绪，需用户邮箱
- [ ] Instagram：计划用邮箱注册
- [ ] TikTok：可能需要海外手机号
- [ ] Facebook Page：需要个人FB账号

### 当前不需要做的
- 投广告（等网站上线）
- 发内容（等网站有链接可以引流）

---

*记录人：Codex 营销部门*

## 2026-06-13
### 资产复查结果

#### 营销资产完整度
- assets/marketing/ 目录结构完整（images/videos/articles/ads/keywords/social/scripts）
- keywords/keywords.md: 50个关键词，5个意图分类，含简繁英三语
- content_plan.md: 10篇知识文章全部完成 + 5个短视频脚本就绪
- social/profiles.md: 品牌名"紫砂雅集 / Zisha Yaji"，5个社媒平台完整方案
- social/account_setup_guide.md: 全平台注册指南（含步骤说明）

#### SEO 基础设施
- Sitemap (src/app/sitemap.ts) — 含静态页、产品页（hreflang）、博客页，URL 为 https://zisha.hu
- Robots (src/app/robots.ts) — 允许所有爬虫，禁止 /admin/ 和 /api/，指向 sitemap.xml
- 博客系统 — 10篇文章双语言（zh-CN/zh-TW），JSON-LD Article Schema，相关文章推荐
- 构建已验证（0 error, 0 warning）

#### 发现问题
1. 博客配图缺失: 10篇文章均引用 /images/blog/*.jpg，但 public/images/blog/ 目录不存在
2. 产品图片缺失: 26个产品数据引用 /images/products/*.jpg，但 public/images/products/ 为空
3. 社媒账号未注册: 属于正常状态，需用户提供邮箱/手机号完成注册验证

### 等真实商品上线后的待办清单
- [ ] 创建 public/images/blog/ 并准备博客配图
- [ ] 获取真实产品照片放入 public/images/products/
- [ ] 注册全部社媒账号（需用户提供注册邮箱/手机号）
- [ ] 设计社媒帖子模板（Pinterest Pin / Instagram Post / TikTok video）
- [ ] 提交 Sitemap 到 Google Search Console
- [ ] 安装 Google Analytics + Facebook Pixel
- [ ] 创建 Google Shopping Ads 产品数据源
- [ ] 启动社媒内容发布计划
- [ ] 规划邮件营销/Newsletter 系统

---

*记录人：Codex 营销部门*
---

# 客服部门工作记录

## 2026-06-13
### 已完成（系统复查与修复）

### 复查发现问题（共9项）
- Help 表单未对接 API -> 已修复
- FAQ API 死代码 -> 已删除
- FAQ 页面硬编码中文 -> 已改用 t()
- Admin 工单页面全硬编码 -> 已改用 t() + i18n
- faqCategories 标签冲突 -> 已修复
- Header FAQ 导航硬编码 -> 已改用 ts()
- tariffs 数据重复 -> 短期保留，标注待统一
- Contact API 内存存储 -> 标注 TODO
- Admin 使用 Mock 数据 -> 标注 TODO

### 修复内容
1. i18n 翻译键补充：新增 22 个翻译键到 zh-CN.json / zh-TW.json
2. FAQ 页面：修复 tariffs 标签键 + 4 处硬编码文字替换
3. Help 页面：表单对接 POST /api/contact + 错误显示 + 提交中禁用状态 + 6 处硬编码文字替换
4. Admin 工单页面：重写组件，移除硬编码 lookup 表
5. Header：FAQ 导航改为 ts()
6. FAQ API：删除死代码 readFaqFromFile() 及无用 import

### 构建验证
- Next.js 构建成功（0 error, 0 warning）
- 所有客服相关页面编译通过

### 待办（等网站上架后）
1. 接入真实订单数据（与 Thread 1 独立站协作）
2. 接入邮件发送功能（发货通知/退换货/复购引导）
3. 接入国际物流查询 API（如 17Track）
4. 建立客户评价管理系统
5. Contact API 接入数据库持久化
6. 退换货/退款处理流程系统化
7. 客服工单与订单系统联动
8. FAQ 数据统一从 API 获取


---

# 商品运营部门工作记录 (Thread 3)

## 2026-06-13
### 已完成管线准备

#### process-product.js — 已修复并验证
- **定价系数改为10倍**（老板确认）：PRICE_COEFFICIENT = 10
- **150元最低定价过滤**：采集价<150元的商品自动跳过
- **sourceSku/sourceUrl/videos映射**：从采集数据保留这些字段
- **Slug中文正则修复**：中文在URL中正常显示
- **dotfiles过滤**：不再读取.taobao_cookies.json等隐藏文件
- **批处理ID计数器修复**：同批次内ID连续递增
- **CSV换行符修复**：转义问题已修正
- **空值安全**：processRawProduct返回null时正确跳过

#### process-images.js — 正常可用
- **Sharp库已安装**（0.35.1）
- **去水印**：可选 --watermark-remove 参数
- **白底图**：背景填充白色
- **统一尺寸**：1200x1200px
- **WebP输出**：85质量，体积缩小约34%
- 视频处理暂不支持，需单独开发

#### 管线验证结果
测试批次：sample-batch-001.json 3件商品成功处理
- zp-001：398元（大红袍西施壶）→ 169 USD
- zp-002：168元（段泥石瓢壶）→ 79 USD
- zp-003：598元（段泥仿古如意壶）→ 169 USD
- 跳过128元朱泥杯（低于150元）
- Shopify CSV导出：简中/繁中各一份
- 图片处理验证：test image -> 1200x1200 WebP

### 清理
- 删除 scripts/.tmp_fixall.js, .tmp_restore.js

### 待办
- 等待 Thread 2 采集数据到达 data/raw_products/
- 数据到达后：process-product.js → process-images.js → 同步到 src/data/products.ts
- 视频处理需后续开发脚本

---
*记录人：Codex 商品运营部门 (Thread 3)*
## 2026-06-13（续）
### 总指挥部复查确认
总指挥部已确认客服系统全部就绪：
- [x] FAQ 知识库完整（发货/物流/退换/开壶/泥料安全）
- [x] 国际物流调研完成（小包/专线/DHL）
- [x] 客服回复模板 8 种场景（简繁双版）
- [x] FAQ 页面、帮助页面、工单管理后台全部就绪并验证通过
- [x] i18n 翻译修复完成（zh-CN/zh-TW）
- [x] npm run build 零错误

### 待命任务
1. [ ] 等 zishapro.com 域名生效，确认 FAQ/工单页面可正常访问
2. [ ] 配合 Thread 1 检查客服页面翻译完整性
3. [ ] 等 Thread 3 处理完第一批商品后，补充商品相关 FAQ 条目（泥料安全性、制作工艺等）
4. [x] tracking.md 已更新

### 等商品上线后对接
- [ ] 接入真实订单数据（Thread 1 协作）
- [ ] 接入邮件发送功能
- [ ] 接入国际物流查询 API
- [ ] 建立客户评价管理系统
- [ ] Contact API 接入数据库持久化
- [ ] 退换货/退款流程系统化
- [ ] 工单系统与订单系统联动
- [ ] FAQ 数据统一从 API 获取

---

## 2026-06-13 — 第一批社媒素材 + 发布计划

### 已完成
- [x] 创建 social/launch_plan.md — 第一批社媒发布计划
  - 覆盖4个平台：Pinterest / Instagram / Facebook / TikTok
  - 8篇帖子文案草稿（每篇简繁双语）
  - 含3个阶段发布节奏 + 预算内广告测试建议
  - SEO行动清单（域名生效后执行）

### 帖子清单
| # | 平台 | 类型 | 发布日 | 主题 |
|---|------|------|--------|------|
| 1 | Pinterest | 信息图 Pin | Day 1 | 紫砂壶养护指南 |
| 2 | Pinterest | 对比图 Pin | Day 2 | 三种泥料对比 |
| 3 | Instagram | 开箱 Reel | Day 3 | 紫砂壶首秀 |
| 4 | Pinterest | 合集 Pin | Day 4 | 经典壶型大全 |
| 5 | Instagram | 轮播 Carousel | Day 5 | 海外华人选壶指南 |
| 6 | Instagram | ASMR Reel | Week 2 | 功夫茶全过程 |
| 7 | Facebook | 群组帖 | Week 2 | 茶文化互动讨论 |
| 8 | TikTok | ASMR 短视频 | Week 3 | 紫砂壶出水展示 |

### 待办（依赖项）
- [等待] 域名 zishapro.com 生效 -> 提交 Sitemap 到 Google Search Console
- [等待] Thread 3 商品数据到位 -> 设计产品页配图
- [等待] 老板提供邮箱/手机号 -> 注册社媒账号
- [等待] 真实产品图 -> 替换帖子中的占位内容并正式发布

---

*记录人：Codex 营销部门*
## 2026-06-13 — Admin 中文乱码修复
### 已完成
- 修复 src/app/admin/product-ops/page.tsx 中所有中文字符乱码（替代?）
- 共修复29处：页面标题、管线状态描述、表格表头、徽章标签、按钮文字、定价显示
- TypeScript 解析验证通过，0语法错误
- 清理临时脚本文件 tmp_fix3.js / tmp_fix4.js / tmp_check.js

### 当前管线状态
- 处理管线 process-product.js ✓（10倍定价，¥150过滤，sourceSku保留）
- 图片管线 process-images.js ✓（Sharp, 1200×1200 WebP）
- Shopify CSV导出 ✓（简中+繁中）
- Admin 后台 ✓（中文正常显示）
- 等待 Thread 2 采集数据到达 data/raw_products/

### 数据到达后的操作流程
1. 运行 
ode scripts/process-product.js 处理商品
2. 运行 
ode scripts/process-images.js 处理图片
3. 同步商品到 src/data/products.ts
4. 导出 Shopify CSV 到 data/exports/

---

*记录人：Codex 商品运营部门 (Thread 3)*

## 2026-06-13 — 端到端管线测试：sample-batch-001

### 测试目标
使用 sample-batch-001.json（4条测试商品）跑通完整上架管线

### 执行记录

#### 步骤1：process-product.js
- **命令**: `node scripts/process-product.js`
- **结果**: 成功处理6件商品（含同时存在的 guyuetang 文件）
- **sample-batch 产出**:
  - zp-004: 大红袍西施壶 ¥398 → $169 USD (10x系数) ✔️
  - zp-005: 段泥石瓢壶 ¥168 → $79 USD (10x系数) ✔️
  - zp-006: 段泥仿古如意壶 ¥598 → $169 USD (10x系数) ✔️
- **跳过**: 朱泥小圆杯 ¥128 < ¥150 过滤 ❌
- **溯源字段**: sourceSku/sourceUrl 均已保留 ✔️
- **Shopify CSV**: 已生成（简中 + 繁中各一份）

#### 步骤2：process-images.js
- **命令**: `node scripts/process-images.js`
- **结果**: 成功处理 1/1 图片（test-product-image.jpg → 1200×1200 WebP, 9.2KB）
- **注意**: sample-batch 引用图片路径为 placeholder，本地 input 目录无对应源图

#### 步骤3：输出验证
- data/processed_products/: 6个 JSON 文件 ✓
- data/exports/: Shopify CSV ✓

#### 步骤4：同步到 products.ts
- 已替换 src/data/products.ts 中 zp-004/zp-005/zp-006 为管线产出 ✔️
- TypeScript 编译检查: 0 errors ✔️
- Next.js 完整构建: 0 errors, 0 warnings ✔️

### 遇见的坑
1. **PowerShell → Node.js 管道编码**: @""...""@ | node 产生 BOM 导致 SyntaxError
2. **Node REPL const 持久化**: MCP node_repl 跨调用保留声明，第二次 import 同变量名报错
3. **sample-batch 无真实图片**: 图片路径为占位符，process-images 找不到对应源文件

### 当前管线状态
| 环节 | 状态 |
|------|------|
| 原始数据采集 | ⏳ Thread 2 进行中 |
| process-product.js | ✅ 通过（10x系数, ¥150过滤, 溯源保留） |
| process-images.js | ⚠️ 通过但无真实产品图 |
| Shopify CSV 导出 | ✅ 通过 |
| 同步到 products.ts | ✅ 通过 |
| Next.js 构建 | ✅ 通过 |

