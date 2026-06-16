 # 项目技术备忘 — 紫砂雅集 (Zisha Yaji)
 
 ## 项目概况
 - **名称**: 紫砂雅集 / Zisha Yaji
 - **定位**: 宜兴紫砂壶跨境茶具商城，主攻海外华人市场
 - **语言**: 简体中文 (zh-CN) + 繁体中文 (zh-TW) 双版本
 - **域名**: zishapro.com（已买，DNS已解析到Vercel，未部署）
 - **GitHub**: juanmaekawa292-stack/zishahu
 - **本地**: F:\codex-yunxing\zishahu
 
 ## 技术栈
 - **框架**: Next.js 16.2.9 (Turbopack)
 - **UI**: React 19.2.4 + Tailwind CSS v4 + Radix UI + lucide-react
 - **国际化**: next-intl v4，配置在 `src/i18n/`
 - **图片处理**: sharp 0.35.x
 - **包管理**: npm (C:\Program Files\nodejs)
 - **开发端口**: 4001 (dev), 4002 (prod)
 
 ## 项目结构
 ```
 src/
   app/[locale]/          — 页面路由
   app/api/               — API路由
   components/            — 组件
   data/products.ts       — 商品数据源
   i18n/                  — 多语言翻译
   services/auth.ts       — 认证服务
 scripts/                 — 处理管线脚本
 data/                    — 数据文件
 docs/                    — 文档
 public/images/products/  — 最终产品图片
 ```
 
 ## 路由一览
 /[locale] 首页, /[locale]/products 商品列表, /[locale]/products/[slug] 商品详情
 /[locale]/cart 购物车, /[locale]/checkout 结算, /[locale]/login 登录
 /[locale]/register 注册, /[locale]/orders 订单, /[locale]/blog 博客
 /[locale]/faq FAQ, /[locale]/help 帮助中心, /[locale]/admin/* 管理后台
 
 ## 当前已上架商品
 - tk-001 归兽壶 ($269, 古悦堂, 单壶/一壶四杯/一壶六杯)
 - tk-002 石瓢壶 ($239, 古悦堂, 彩绘/刻绘/素颜 x 单壶/套装)
 
 ## 定价: 采集价 x 10 / 7.3 -> USD取整, 低于150元跳过
 
 ## 支付: 连连国际已注册等待审核, Stripe/PayPal预留未配置
 
 ## 踩过的坑
 1. 不要往Thread发图片(一张5-30万token)
 2. 水印检测用detect-watermark.js纯代码, 不用AI
 3. Next.js 16.2.9有breaking changes
 4. 天猫店铺: https://guyuetang.tmall.com
 
 ## 启动: cd F:\codex-yunxing\zishahu && npm run dev -- -p 4001
