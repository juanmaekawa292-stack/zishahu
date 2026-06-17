# 数据优化方案

## 目标
一次性补齐所有商品数据

## 参考
D:\图快下载器\淘宝采集\616\75_古悦堂宜兴紫砂壶纯手工泡茶壶一人独饮小壶功夫茶具单壶汉棠石瓢

## xlsx列结构
0:货号 1:商品链接 2:店铺名称 3:商品名称 4:主图(\n分隔) 5:主图视频 6:详情图 7:SKU图片 8:SKU信息(JSON) 9:采集图片数 10:采集视频数

## SKU信息格式
{size,price,stock,image_name,spec:[[容量,200ml],[泥料,紫泥]]}

## 修复项
1. detailImages(详情图) — 从xlsx列G提取
2. variants(SKU变体) — 从xlsx列I解析
3. 主图补全 — 从xlsx列E补全
4. videos(视频) — 从xlsx列F提取
5. specs(规格参数) — 从SKU spec聚合

## COS配置路径
Bucket: zishahu-images-1301674224
Region: ap-hongkong

## 路径
products/tk-xxx/main_x.webp (主图)
products/tk-xxx/detail_y.webp (详情图)
products/tk-xxx/variant_z.webp (SKU图)
videos/tk-xxx.mp4 (视频)
