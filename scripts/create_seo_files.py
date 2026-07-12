#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def w(p, c):
    fp = os.path.join(base, p)
    d = os.path.dirname(fp)
    if not os.path.exists(d): os.makedirs(d)
    with open(fp, 'w', encoding='utf-8') as f: f.write(c)
    print('Created: ' + p)

# --- SOP doc ---
sop = """# SEO 部门每日工作 SOP

> 部门：SEO 运营部 | 站点：zishapro.com | 更新：2026-07-12

---

## 每日工作流程（按优先级排序）

### 1. 网站健康检查（每天 09:00）
- [ ] 检查 zishapro.com 是否正常访问（HTTP 200）
- [ ] 检查页面有无乱码
- [ ] 检查 sitemap.xml 是否可访问
- [ ] 检查 Vercel 最新部署状态
**产出：** 记录到 operation-log.md

### 2. Google Search Console 数据检查（每天 09:30）
- [ ] 查看昨日：展示次数（Impressions）
- [ ] 查看昨日：点击次数（Clicks）
- [ ] 查看昨日：平均排名（Avg Position）
- [ ] 查看昨日：点击率（CTR）
- [ ] 检查是否有新的收录异常或 404 错误
**重点关注：** yixing teapot、紫砂壶 购买 等核心关键词

### 3. Google Analytics 数据分析（每天 10:00）
- [ ] 查看昨日：会话数（Sessions）
- [ ] 查看昨日：用户数（Users）
- [ ] 查看昨日：页面浏览量（Page Views）
- [ ] 查看跳出率和流量来源分布

### 4. 竞争对手监控（每天 10:30）
- [ ] 检查 Amazon 上 yixing teapot 搜索结果变化
- [ ] 检查主要竞品独立站更新

### 5. 内容优化（每周一/三/五）
- [ ] 检查产品 Meta Title / Description
- [ ] 检查图片 Alt Text

### 6. 技术 SEO（每周二/四）
- [ ] 检查 PageSpeed 分数
- [ ] 检查是否有死链

### 7. 博客内容（每周至少 2 篇）
- 英文：购买指南 / 紫砂文化
- 繁体中文：养壶 / 功夫茶冲泡
- 简体中文：面向海外华人

### 8. 外链建设（每周）
- 寻找紫砂/茶文化论坛
- 在相关博客互动

### 9. 日报生成（每天 17:00）
- [ ] 汇总今日工作到 operation-log.md

---

## 关键词监控

英文核心词：yixing teapot (~22K), yixing teapot for sale (~3.6K), authentic yixing teapot (~1.8K), zhuni teapot (~1.2K)
繁体中文：紫砂壶 (~40K), 宜兴紫砂壶 (~8K), 紫砂壶 推荐 (~3.2K), 紫砂壶 购买 (~1.8K)
简体中文：紫砂壶 购买 (~1.6K), 紫砂壶 手工 (~1.2K)

## 周报模板（每周五）
1. 本周流量数据（GSC + GA4）
2. 关键词排名变化
3. 新发布内容列表
4. 竞品动态
5. 下周工作计划

## 注意事项
- 所有操作记录到 docs/seo/operation-log.md
- 重要变化通过企业微信通知总指挥部
- 每周五 17:00 前提交周报
"""

w('docs/seo/seo-daily-sop.md', sop)
print('ALL DONE')
