# 紫砂雅集 - 知识库

## 项目信息
- 网站: https://zishapro.com
- 仓库: F:\codex-yunxing\zishahu
- 管理工具: F:\codex-yunxing\紫砂壶管理系统 (Python HTTP服务器 :4567)
- COS: zishahu-images-1301674224 (ap-hongkong)
- 部署: GitHub -> Vercel 自动部署

## 商品文件夹结构
每个商品在 D:\图快下载器\淘宝采集\616\ 或 \0615\ 下有一个子文件夹

文件夹内容:
- 商品名.xlsx — SKU数据(sheet: sku) + 规格参数(sheet: 商品属性)
- 主图_1.jpg ~ 主图_5.jpg — 主图
- 详情_1.jpg ~ 详情_N.jpg — 详情图 (详情_1跳过不上传)
- 1.mp4 — 视频
- 页面数据.txt — 备用规格参数
- 商品链接.txt — 淘宝链接
- 编号_名称.jpg — SKU变体图 (编号从11开始)

## xlsx结构
所有xlsx都有两个sheet:
1. sku sheet: A=名称, B=图片, C=skuId, D=价格, E=优惠前, L=产品链接, M=产品名称
2. 商品属性 sheet: A=属性名称, B=属性值 (规格参数来源)

## 11个规格参数映射
烧制窑型 -> firingType
容量 -> capacity
主图来源 -> mainImageSource
产地 -> origin
是否手工 -> handmade
材质 -> material
壶型 -> shapeType
包装形式 -> packaging
窑系 -> kiln
年代 -> year
颜色分类 -> color
泥料 -> clay (额外)
工艺 -> craft (额外)

## COS路径规则
products/tk-xxx/main_1~5.webp — 主图
products/tk-xxx/detail_2~N.webp — 详情图 (跳过详情_1)
products/tk-xxx/variant_xxx.webp — SKU变体图
videos/tk-xxx.mp4 — 视频

## 重要注意事项
1. 文件编码: 写中文products.ts时一定用UTF-8编码，不能用Node.js REPL的writeFileSync
2. 详情_1.jpg不上传（和主图_1重复）
3. slug直接用中文标题（不是拼音）
4. products.ts格式用双引号JSON风格
