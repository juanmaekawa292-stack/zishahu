# Deploy Trigger
Deployed at: 2026-06-17T11:20:08.789Z
 # Deploy Trigger
 Deployed at: 2026-07-05T17:53:00.000Z
 
 ## 2026-07-05 Checkout修复
 - **Tax**: 移除税费 (tax = 0)，订单不显示税费行
 - **地址校验**: PayPal按钮添加 onValidate 回调，空地址时阻止弹窗并提示
 - **闭包修复**: PayPalButton 用 useRef 避免闭包过期
 - **测试结果**: API全部正常 (checkout 201, PayPal create-order 200)
 - **PayPal模式**: 保持 sandbox，等审核通过再切 live
 

## Phase 1: Blog Content English Localization (2026-07-10)
- **Status**: ✅ Completed
- **Changes**:
  - Extended BlogPost interface with 	itle_en, excerpt_en, content_en fields
  - Inserted English content for all 10 blog posts (reconstructed from corrupted git history)
  - Added en locale to layout.tsx generateStaticParams (was missing, causing no EN page generation)
  - TypeScript build verified (105 static pages, all EN routes active)
- **Issues encountered**:
  - Previous LLM corrupted log.ts with 456 invalid UTF-8 sequences (Chinese bytes replaced with 0x3F)
  - Had to restore clean original from commit history and extract English content from corrupted blob
  - generateStaticParams in layout only included zh-CN and zh-TW; EN pages weren't being generated
- **Next**: Phase 2 - Product data English translation
## Phase 2: Product Data English Translation (2026-07-10)
- **Status**: ✅ Completed
- **Changes**:
  - Fixed 355 missing `]` in variant arrays across products.ts (pre-existing structural bug)
  - Patched ProductDetailContent.tsx to use specs_en when locale is "en"
  - Patched ProductPageClient.tsx JSON-LD to use specs_en when locale is "en"
  - Polished Chinese specs values in specs_en fields (shape names, scenarios, kiln types, etc.)
  - TypeScript build verified (105 static pages, all locales clean)
- **Issues encountered**:
  - products.ts had ~355 instances where variant array closing `]` was missing (bare comma instead of `],`)
  - PowerShell encoding issues when writing temp Python scripts (UTF-16 default vs UTF-8)
  - Previous agent's temp scripts (*.cjs, *.mjs, *.bak) left in workspace — cleaned up
- **Next**: Phase 3 - New English blog posts (6+ articles targeting high-volume keywords)

## Phase 3: New English Blog Articles (2026-07-10)
- **yixing-vs-ceramic-teapot** ✅ (commit e197ea2)
  - Keyword targets: "Yixing vs ceramic teapot", "is Yixing teapot worth it"
  - 111 static pages, build clean
- **Next**: how-to-season-yixing-teapot

## Phase 3: New English Blog Articles (2026-07-10)
- **yixing-vs-ceramic-teapot** ✅ (commit e197ea2)
- **how-to-season-yixing-teapot** ✅ (commit 2b4cd39)
- **Next**: best-yixing-teapot-for-oolong

## Phase 3: New English Blog Articles (2026-07-10) — Completed ✅
- **yixing-vs-ceramic-teapot** ✅ (commit e197ea2)
- **how-to-season-yixing-teapot** ✅ (commit 2b4cd39)
- **best-yixing-teapot-for-oolong** ✅ (commit 6b0360b)
- **handmade-vs-half-handmade-teapot** ✅ (commit b5d86ff)
- **zhuni-teapot-best-tea** ✅ (commit f0fd2f2)
- **how-to-tell-authentic-yixing-teapot** ✅ (commit f0fd2f2)
- **Build**: 126 static pages, all locales clean
- **Issues encountered**:
  - zhuni entry from previous agent only had Chinese fields (missing English), had to rewrite complete entry
  - Both articles committed together in one commit since they share blog.ts file
- **Next**: Phase 4 - Submit sitemap to Google Search Console & install Google Analytics
 
 ## Phase 4: GA4 + Facebook Pixel + Sitemap (2026-07-11)
 
 ### 1. Google Analytics 4 (GA4) — 代码已就绪，等待 Measurement ID
 - **Status**: ⏳ Code ready, awaiting Measurement ID from boss
 - **Changes**:
   - Created `src/components/analytics/GoogleAnalytics.tsx` — 使用 next/script Strategy.AfterInteractive 加载 GA4
   - GA4 只在 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 环境变量有值时才激活（空值时不渲染）
   - 在 `src/app/[locale]/layout.tsx` 中添加了 `<GoogleAnalytics />` 组件
   - 在 `.env.local` 中添加了 `NEXT_PUBLIC_GA_MEASUREMENT_ID=` 占位变量
 - **How to activate**:
   1. 老板登录 https://analytics.google.com 用谷歌账户注册 GA4 账号
   2. 创建属性（Property），网站名 zishapro.com，URL: https://zishapro.com
   3. 获取 Measurement ID（格式: G-xxxxxxxxxx）
   4. 将 ID 填入 `.env.local`: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxxxxxxxxx`
   5. 重新部署到 Vercel（或在 Vercel 环境变量里添加 `NEXT_PUBLIC_GA_MEASUREMENT_ID`）
   6. 打开网站首页，在 GA4 实时报告确认数据
 - **Implementation details**:
   - 使用 `next/script` 的 `strategy="afterInteractive"`，不阻塞页面渲染
   - 两个 Script 标签：一个加载 gtag.js，一个执行 gtag('config')
   - gtag 数据层在 window.dataLayer 上初始化
 
 ### 2. Facebook Pixel — 代码已就绪，等待 Pixel ID
 - **Status**: ⏳ Code ready, awaiting Pixel ID from boss
 - **Changes**:
   - Created `src/components/analytics/FacebookPixel.tsx` — 使用 next/script Strategy.AfterInteractive 加载 Facebook Pixel
   - Facebook Pixel 只在 `NEXT_PUBLIC_FB_PIXEL_ID` 环境变量有值时才激活
   - 在 `src/app/[locale]/layout.tsx` 中添加了 `<FacebookPixel />` 组件
   - 在 `.env.local` 中添加了 `NEXT_PUBLIC_FB_PIXEL_ID=` 占位变量
 - **How to activate**:
   1. 老板登录 https://business.facebook.com 创建 Business Suite 账号
   2. 在 Meta Events Manager 中创建 Data Source → Web → Pixel
   3. 获取 Pixel ID（一串数字）
   4. 将 ID 填入 `.env.local`: `NEXT_PUBLIC_FB_PIXEL_ID=1234567890`
   5. 重新部署到 Vercel
   6. 用 Facebook Pixel Helper 浏览器插件验证
 - **Implementation details**:
   - fbq 基础代码（noscript 图片标签没有加，因为 next/script 已确保 JS 执行）
   - Pixel 在每次页面加载时发送 PageView 事件
   - 后续可在关键转化事件（AddToCart, Purchase）添加 fbq('track') 调用
 
 ### 3. Sitemap 提交到 Google Search Console
 - **Status**: ⏳ Sitemap confirmed ready, domain verification needed from boss
 - **Sitemap status**:
   - `src/app/sitemap.ts` 已存在且完整包含：
     - ✅ 8 个静态页面（首页、/products、/cart、/checkout、/login、/register、/faq、/help）
     - ✅ 所有产品页面（~192件，按 featured 分配 0.9/0.8 优先级）
     - ✅ 所有博客文章（带 0.7 优先级）
     - ✅ 三语言 hreflang 交替链接（zh-CN root + zh-TW + en）
   - `src/app/robots.ts` 已指向 `https://zishapro.com/sitemap.xml`
 - **How to submit**:
   1. 老板登录 https://search.google.com/search-console 用谷歌账户
   2. 添加属性 → 域名 → 输入 `zishapro.com`
   3. DNS 验证：在腾讯云 DNS 添加 TXT 记录（Search Console 提供验证字符串）
   4. 验证通过后，进入 Sitemaps 页面
   5. 提交 Sitemap URL: `https://zishapro.com/sitemap.xml`
   6. 等待 Google 抓取（可能需要几小时到几天）
   7. 检查索引状态，确保页面被收录
 - **Notes**: 域名 DNS 解析在腾讯云，需要在 dnspod/腾讯云 DNSPod 控制台添加 TXT 记录
 
 ## TODO / Blockers
 - [ ] 老板注册 GA4 账号获取 Measurement ID
 - [ ] 老板创建 Facebook Pixel 获取 Pixel ID
 - [ ] 老板操作腾讯云 DNS 添加 TXT 记录完成 Search Console 验证
 - [ ] 所有配置完成后重新部署到 Vercel
