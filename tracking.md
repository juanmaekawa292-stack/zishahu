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
