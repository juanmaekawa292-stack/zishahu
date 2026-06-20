from PIL import Image
import os, glob

# Check source images from different products
folders = glob.glob(r"D:\图快下载器\淘宝采集\0615\00_*")
for f in folders[:3]:
    files = [x for x in os.listdir(f) if x.startswith("主图_") and x.endswith((".jpg",".png",".jpeg"))]
    if files:
        img = Image.open(os.path.join(f, files[0]))
        print(os.path.basename(f)[:30], files[0], img.size)

# Also check what COS stores
import requests, io
r = requests.get("https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/tk-001/main_1.webp")
img = Image.open(io.BytesIO(r.content))
print("COS main_1:", img.size)

r2 = requests.get("https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/tk-002/main_1.webp")
img2 = Image.open(io.BytesIO(r2.content))
print("COS main_2:", img2.size)
