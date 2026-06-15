import os
import re
from PIL import Image

PRODUCT_IMG_DIR = r"F:\codex-yunxing\zishahu\public\images\products"
VIDEO_DIR = r"F:\codex-yunxing\zishahu\public\videos\products"

def _ensure_dir(path):
    if not os.path.isdir(path):
        os.makedirs(path, exist_ok=True)

def convert_to_webp(src_path, dest_path, quality=80, max_width=2000):
    """Convert JPG/PNG to WebP with optional resize"""
    try:
        _ensure_dir(os.path.dirname(dest_path))
        img = Image.open(src_path)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        if img.width > max_width:
            ratio = max_width / img.width
            new_h = int(img.height * ratio)
            img = img.resize((max_width, new_h), Image.LANCZOS)
        img.save(dest_path, "WEBP", quality=quality)
        return dest_path
    except Exception as e:
        print(f"[ERROR] 转换图片失败 {src_path}: {e}")
        return None

def copy_video(src_path, dest_path):
    try:
        _ensure_dir(os.path.dirname(dest_path))
        with open(src_path, "rb") as sf:
            with open(dest_path, "wb") as df:
                df.write(sf.read())
        return dest_path
    except Exception as e:
        print(f"[ERROR] 复制视频失败 {src_path}: {e}")
        return None

def process_product_images(product_id, folder_path, image_info):
    """处理产品图片：主图/详情图/SKU图/视频 → WebP + 整理目录"""
    product_dir = os.path.join(PRODUCT_IMG_DIR, product_id)
    _ensure_dir(product_dir)

    results = {"images": [], "detailImages": [], "variantImages": {}, "videos": []}

    # 主图
    for idx, fname in enumerate(image_info.get("mainImages", [])):
        src = os.path.join(folder_path, fname)
        dst_name = f"main_{idx + 1}.webp"
        dst = os.path.join(product_dir, dst_name)
        if os.path.isfile(src) and convert_to_webp(src, dst):
            results["images"].append(f"/images/products/{product_id}/{dst_name}")

    # 详情图
    for idx, fname in enumerate(image_info.get("detailImages", [])):
        src = os.path.join(folder_path, fname)
        dst_name = f"detail_{idx + 2}.webp"
        dst = os.path.join(product_dir, dst_name)
        if os.path.isfile(src) and convert_to_webp(src, dst):
            results["detailImages"].append(f"/images/products/{product_id}/{dst_name}")

    # detailLong.jpg
    dl = image_info.get("detailLong")
    if dl:
        src = os.path.join(folder_path, dl)
        dst = os.path.join(product_dir, "detail_long.webp")
        if os.path.isfile(src) and convert_to_webp(src, dst):
            results["detailImages"].append(f"/images/products/{product_id}/detail_long.webp")

    # SKU 变量图
    for vkey, fname in image_info.get("variantImages", {}).items():
        if fname is True:
            continue
        src = os.path.join(folder_path, fname)
        safe_key = re.sub(r"[^a-zA-Z0-9_-]", "_", str(vkey)).lower()
        dst_name = f"variant_{safe_key}.webp"
        dst = os.path.join(product_dir, dst_name)
        if os.path.isfile(src) and convert_to_webp(src, dst):
            results["variantImages"][vkey] = f"/images/products/{product_id}/{dst_name}"

    # 视频
    for idx, fname in enumerate(image_info.get("videos", [])):
        src = os.path.join(folder_path, fname)
        ext = os.path.splitext(fname)[1]
        dst_name = f"product{ext}" if idx == 0 else f"product_{idx + 1}{ext}"
        vdir = os.path.join(VIDEO_DIR, product_id)
        dst = os.path.join(vdir, dst_name)
        if os.path.isfile(src) and copy_video(src, dst):
            results["videos"].append(f"/videos/products/{product_id}/{dst_name}")

    return results
