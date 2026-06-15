# 商品图片P图流程SOP — 豆包协作版

## 整体分工
- **老板（人类）**：在豆包（Doubao AI）中执行图片编辑操作
- **Thread 3（Codex）**：处理前后端衔接、格式转换、文件管理、上架同步

## 标准流程

### Step 1: 老板在豆包中P图
1. 打开豆包AI（网页/App）
2. 上传商品原图
3. 执行编辑操作：
   - 去水印（天猫/店铺Logo）
   - 白底图处理
   - 调色/亮度/对比度优化
   - 裁切构图
4. 下载编辑后的图片到本地

### Step 2: 存放图片
老板把P好的图放到:
`
D:\图快下载器\P图成品\
`
按商品名建子文件夹，例如:
`
D:\图快下载器\P图成品\归兽壶\main_1.jpg
D:\图快下载器\P图成品\归兽壶\main_2.jpg
`

### Step 3: Thread 3 处理上架
1. 从 D:\图快下载器\P图成品\ 复制图片到 data/images/input/
2. 运行 
ode scripts/process-images.js 统一处理（1200×1200 WebP）
3. 处理后的图放到 public/images/products/[商品ID]/
4. 运行 
ode scripts/process-product.js 生成商品数据
5. 更新 src/data/products.ts

### Step 4: 验证
- 访问 localhost:4001 确认商品图正常显示
- 检查图片链接是否返回 HTTP 200
- 更新 tracking.md 记录

## 图片规范
- 最终格式: WebP
- 尺寸: 1200×1200px
- 质量: 85%
- 背景: 纯白 RGB(255,255,255)
- 去水印区域: 底部左右各 300×70px

## 文件存放规则
| 类型 | 路径 |
|------|------|
| 原图（未处理） | data/images/input/ |
| 处理后WebP | data/images/processed/ |
| 产品展示图 | public/images/products/[商品ID]/ |
| 备份原图 | data/images/backup/ |
| 老板P图成品 | D:\图快下载器\P图成品\ |
