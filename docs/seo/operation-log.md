 # SEO 运营日志

 - 部门：SEO 运营部门
 - 域名：zishapro.com
 - 站点：紫砂雅集 (Zisha Artisan) — 宜兴紫砂壶跨境独立站
 - 语言：简体中文 (zh-CN) / 繁体中文 (zh-TW) / 英文 (en)
 - 商品总量：约192件
 - 目标市场：美国、加拿大、新加坡、印尼、泰国、马来西亚、英国、澳大利亚
 - 记录开始：2026-07-11

 ## 2026-07-11

 ### 启动阶段

 **部门初始化完成。** SEO 运营部门正式成立，负责 zishapro.com 搜索引擎优化与流量增长。

 **已完成：**
 - 创建 docs/seo/ 工作目录
 - 完成网站 SEO 技术审计
 - 完成目标市场关键词研究
 - 完成竞品 SEO 策略分析
 - 完成各国家 SEO 策略规划
 - 识别内容缺口和优化计划

 **当前状态：**
 - GA4 未安装 — 等待技术部门（Thread 1）处理
 - GSC Sitemap 未提交 — 等待技术部门处理
 - PayPal 仍为 sandbox 模式

 ---

 ### SEO 技术审计发现

 **严重问题（需立即修复）：**

 1. **metadataBase 域名错误** — `src/app/layout.tsx` 中 metadataBase 设置为 `https://zisha.hu`，应为 `https://zishapro.com`
 2. **SEO 库 BASE_URL 错误** — `src/lib/seo.ts` 中 BASE_URL 设置为 `https://zisha.hu`，应为 `https://zishapro.com`
 3. **Root layout html lang 硬编码** — `src/app/layout.tsx` 固定 zh-CN，不会随页面语言变化
 4. **Sitemap 使用 zishapro.com，但 SEO 代码使用 zisha.hu** — 两处不一致

 **中等问题：**

 5. **缺少 Article Schema** — 博客页面上需要检查是否正确注入了 Article 结构化数据
 6. **产品详情页缺少语言切换的 hreflang 确认** — 建议验证每个语言版本是否正确关联
 7. **缺少 FAQ Schema** — FAQ 页面虽存在（/faq），但未使用 FAQPage 结构化数据
 8. **缺少 BlogList/BlogIndex Schema** — 博客列表页没有 CollectionPage 结构化数据
 9. **缺少 Organization Schema** — 网站首页及全局缺少 Organization/Brand 结构化数据
 10. **产品类别页面未针对SEO优化** — /products（全部商品列表）缺少分类特定的元描述

 **改进建议：**

 11. 添加 breadcrumb 结构化数据到产品列表页
 12. 商品页面缺少规范的 about/mentions
 13. 缺少 SiteNavigationElement 结构化数据
 14. 考虑为长尾关键词添加 FAQ 页面
 15. 图片缺少 alt 文本的全面审计

 ---

 ### 目标市场关键词研究摘要

 详见 [keyword-research.md](./keyword-research.md)

 **英文核心关键词（高流量）：**
 - "yixing teapot" — 月搜索量 ~22K，中等难度
 - "yixing teapot for sale" — 月搜索量 ~3.6K，低到中难度
 - "yixing clay teapot" — 月搜索量 ~3.2K
 - "yixing zisha teapot" — 月搜索量 ~2.9K
 - "authentic yixing teapot" — 月搜索量 ~1.8K，高转化意图
 - "zhuni teapot" — 月搜索量 ~1.2K，高转化意图
 - "yixing teapot price" — 月搜索量 ~900，高购买意图

 **繁体中文核心关键词：**
 - "紫砂壶" — 月搜索量 ~40K（全球）
 - "宜興紫砂壺" — 月搜索量 ~8K
 - "紫砂壺 推薦" — 月搜索量 ~3.2K
 - "紫砂壺 價格" — 月搜索量 ~2.4K，高转化
 - "紫砂壺 購買" — 月搜索量 ~1.8K，高转化

 **简体中文核心关键词（面向海外华人）：**
 - "紫砂壶 购买" — 月搜索量 ~1.6K
 - "紫砂壶 手工" — 月搜索量 ~1.2K
 - "紫砂壶 泡什么茶" — 月搜索量 ~900

 **各国家搜索特点：**
 - 美国/加拿大：英文关键词搜索为主，繁体中文为辅（老移民）
 - 新加坡/马来西亚：简体中文 + 英文混合搜索
 - 印尼/泰国：繁体中文（华人社区）
 - 英国/澳洲：英文搜索为主

 ---

 ### 竞品分析摘要

 详见 [competitor-analysis.md](./competitor-analysis.md)

 **主要竞品渠道：**
 - Amazon（yixing teapot 搜索结果）：约 3000+ 商品，价格 $20-$500
 - Etsy（手工紫砂壶）：约 5000+ listing，价格 $30-$800
 - 独立站竞品：YixingSelection.com, MudAndLeaves.com, GlobalTeaHat.com, CrimsonLotusTeaware.com
 - AliExpress（大量低价仿品）

 **竞品 SEO 弱点（我们的机会）：**
 - 多数竞品缺少完善的多语言 hreflang 支持
 - 绝大多数竞品不提供繁体中文内容
 - Amazon/Etsy 商品页缺少结构化数据
 - 独立站竞品大多仅英文，缺乏华人市场覆盖
 - 竞品博客内容质量普遍一般

 ---

 ### 各市场 SEO 策略分配

 | 地区 | 主要语言 | 次要语言 | 核心策略 |
 |------|---------|---------|---------|
 | 美国 | 英文 (en) | 繁体中文 (zh-TW) | Google SEO + Amazon 外部链接 |
 | 加拿大 | 英文 (en) | 繁体中文 (zh-TW) | 同上，增加加拿大特定关键词 |
 | 新加坡 | 简体中文 (zh-CN) | 英文 (en) | 百度/Google 双管齐下 |
 | 马来西亚 | 简体中文 (zh-CN) | 英文 (en) | 类似新加坡策略 |
 | 印尼 | 繁体中文 (zh-TW) | 英文 (en) | 繁体中文为主要输入语言 |
 | 泰国 | 繁体中文 (zh-TW) | 英文 (en) | 台湾/东南亚繁体市场 |
 | 英国 | 英文 (en) | - | 英国拼写 variant + 英国茶文化关键词 |
 | 澳大利亚 | 英文 (en) | - | 澳洲特定关键词 |

 ---

 ### 内容缺口识别

 **已有关键词覆盖：** 约10个中文主题 + 6个英文主题

 **急需补充的内容：**
 1. 英文：各产品类别的导购内容（购买指南 > 收藏推荐）
 2. 英文：紫砂壶 vs 其他茶壶的比较文章
 3. 英文：不同国家买家的购买指南（each market）
 4. 繁体中文：紫砂壶养护（翻写中文版 + 添加繁体台湾用语）
 5. 繁体中文：功夫茶冲泡（台湾风格版本）
 6. 多语言：运输/物流指南（"如何从中国购买紫砂壶"）
 7. 繁体中文：送礼指南（紫砂壶作为礼品的选购建议）
 8. 英文：Gongfu tea 新手入门指南

 **产品页面优化：**
 - 为所有产品生成独特的、富含关键词的 meta description
 - 优化英文和繁体中文的页面 title
 - 考虑为高价值产品添加 FAQ 段落（增加富文本 snippet 机会）

 ---

 ### 待办清单

 - [✅] 创建 docs/seo/ 工作目录
 - [✅] SEO 技术审计
 - [✅] 目标市场关键词研究
 - [✅] 竞品 SEO 策略分析
 - [✅] 各市场 SEO 策略规划
 - [✅] 内容缺口分析
 - [ ] 等 Thread 1 安装 GA4 并提交 Sitemap 到 GSC
 - [ ] 获取 GA4 和 GSC 访问权限
 - [ ] 向技术部门提交域名修复工单（zisha.hu → zishapro.com）
 - [ ] 使用 Python 提取产品数据，分析当前 meta title/description
 - [ ] 检查产品详情页 hreflang 是否正确
 - [ ] 研究 Google Search Console 设置方法（提前准备）
 - [ ] 准备第一份周报模板
 - [ ] 编写第7篇英文博客（产品购买指南）
 - [ ] 编写第1篇繁体中文博客
 - [ ] 分析现有产品的 SEO 标题和描述优化空间
