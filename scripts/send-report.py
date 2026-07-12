import urllib.request, json
data = json.dumps({"msgtype":"text","text":{"content":"紫砂雅集 · 今日总指挥部报告\n━━━━━━━━━━━━━━\n\n✅ 已完成的修复：\n1. Facebook Pixel 部署成功！fbq 代码已加载到网站\n2. SEO 域名全面修正 (zisha.hu → zishapro.com)\n   - 所有商品 JSON-LD 结构化数据\n   - 面包屑、OG 图片、博客内容\n3. 微信通知编码修复（Python UTF-8 方案）\n4. 网站验证：GA4正常 / GSC sitemap 542页 / PayPal live\n\n━━━ 引流计划 ━━━\n1. SEO: 关键词部署 / 结构化数据增强 / 博客 SEO 优化\n2. Facebook 广告像素已就绪\n3. 社媒账号注册（需你提供邮箱注册 Pinterest/IG/TikTok）\n4. Google Shopping 产品数据源\n\n总指挥部 | 2026-07-12"}}, ensure_ascii=False).encode("utf-8")
req = urllib.request.Request("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e15090c0-e828-4839-8c5f-1aa94a9af6f6", data=data, headers={"Content-Type":"application/json"})
resp = urllib.request.urlopen(req)
print(json.loads(resp.read().decode()))
