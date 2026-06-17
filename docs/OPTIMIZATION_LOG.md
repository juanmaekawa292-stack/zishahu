# 紫砂雅集 - 优化记录

## 2026-06-17: 规格参数问题修复
问题: products.ts中文乱码（UTF-8编码问题），导致规格参数显示不出来
原因: 用Node.js REPL的writeFileSync写入中文文件时编码出错
修复: 从git恢复后用正确UTF-8编码重写文件
教训: 写入含中文的文件时一定用正确UTF-8编码

## 2026-06-17: 商品卡片图片裁剪问题
问题: 首页主图显示被裁剪
原因: aspect-[3/4]比例导致object-cover裁剪
修复: 改为aspect-square + object-contain + p-2

## 上架系统 v3.0 重构 (2026-06-17)
问题: 管理工具使用旧的上架逻辑（本地存储、拼音slug、3个规格字段）
修复: 重写整个上架系统:
- scanner.py: 正确解析xlsx的sku+商品属性sheet，提取11个规格参数
- image_processor.py: 直接上传COS（cos-python-sdk-v5），不用本地存储
- store_writer.py: 完整11规格参数 + 正确products.ts双引号JSON格式
- app.py: 单个商品上传 + git自动commit/push触发Vercel部署
- index.html: 勾选式上传界面
