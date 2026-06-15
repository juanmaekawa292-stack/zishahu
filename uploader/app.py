import os
import sys
import json
import urllib.parse
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add current dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import scanner
import image_processor
import store_writer

PORT = 4567
TEMPLATES_DIR = os.path.join(r"F:\codex-yunxing\zishahu\uploader", "templates")
SOURCE_JSON_PATH = r"F:\codex-yunxing\zishahu\data\source_products.json"


class UploaderHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        try:
            if path == "/":
                self._serve_static("index.html")
            elif path == "/api/status":
                self._handle_status()
            elif path == "/api/scan":
                self._handle_scan()
            elif path == "/api/products":
                self._handle_list_products()
            elif path == "/api/preview-image":
                self._handle_preview_image(params)
            else:
                # Try serving as static file
                static_path = os.path.join(TEMPLATES_DIR, path.lstrip("/"))
                if os.path.isfile(static_path):
                    self._serve_static(path.lstrip("/"))
                else:
                    self._send_json(404, {"success": False, "error": "Not found"})
        except Exception as e:
            print(f"[ERROR] {path}: {e}")
            self._send_json(500, {"success": False, "error": str(e)})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        try:
            # Read POST body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8")) if body else {}

            if path == "/api/upload":
                self._handle_upload(data)
            elif path == "/api/set-dirs":
                self._handle_set_dirs(data)
            elif path == "/api/scan-custom":
                self._handle_scan_custom(data)
            elif path == "/api/auto-upload":
                self._handle_auto_upload(data)
            else:
                self._send_json(404, {"success": False, "error": "Not found"})
        except json.JSONDecodeError as e:
            self._send_json(400, {"success": False, "error": f"Invalid JSON: {e}"})
        except Exception as e:
            print(f"[ERROR] POST {path}: {e}")
            import traceback
            traceback.print_exc()
            self._send_json(500, {"success": False, "error": str(e)})

    # ===== Handlers =====

    def _handle_status(self):
        dirs_ok = sum(1 for d in scanner.SOURCE_DIRS if os.path.isdir(d))
        folders = scanner.find_product_folders()
        ids = store_writer.get_current_product_ids()
        self._send_json(200, {
            "success": True, "status": "running",
            "sourceDirs": dirs_ok, "productFoldersFound": len(folders),
            "productsUploaded": len(ids), "productIds": ids, "port": PORT,
        })

    def _handle_scan(self):
        all_folders = scanner.find_product_folders()
        existing_ids = store_writer.get_current_product_ids()

        source_products = []
        if os.path.isfile(SOURCE_JSON_PATH):
            with open(SOURCE_JSON_PATH, "r", encoding="utf-8") as f:
                source_products = json.load(f).get("products", [])

        results = []
        for folder in all_folders:
            folder_name = os.path.basename(folder)
            page_data = scanner.parse_page_data(folder)
            if not page_data or not page_data.get("title"):
                continue

            images = scanner.detect_images(folder)
            shape = scanner.detect_shape(page_data["title"])
            category = scanner.detect_category(page_data["title"])
            slug = scanner.pinyinify(page_data["title"])

            # Check if uploaded
            already_uploaded = any(
                p.get("title_zhCN") == page_data["title"]
                or p.get("slug") == slug
                or (page_data.get("sourceUrl") and p.get("source_url") == page_data["sourceUrl"])
                or any(page_data["title"] in img for img in p.get("images", []))
                for p in source_products
            )

            results.append({
                "folder": folder, "folderName": folder_name,
                "title": page_data["title"], "slug": slug,
                "shape": shape, "category": category,
                "price": page_data.get("price", 0),
                "variants": page_data.get("variants", []),
                "specs": page_data.get("specs", {}),
                "sourceUrl": page_data.get("sourceUrl", ""),
                "itemId": page_data.get("itemId", ""),
                "images": {
                    "mainImages": images["mainImages"],
                    "detailImages": images["detailImages"],
                    "variantImages": list(images["variantImages"].keys()),
                    "videos": images["videos"],
                },
                "reviewText": "",
                "alreadyUploaded": already_uploaded,
                "inProductsList": slug in existing_ids,
            })

        self._send_json(200, {"success": True, "products": results, "total": len(results)})

    def _handle_upload(self, data):
        folder = data.get("folder", "")
        title = data.get("title", "")
        slug = data.get("slug", "")
        shape = data.get("shape", "")
        category = data.get("category", "teapot")
        price = data.get("price", 0)
        variants = data.get("variants", [])
        specs = data.get("specs", {})
        source_url = data.get("sourceUrl", "")
        item_id = data.get("itemId", "")

        
        multiplier = float(data.get("multiplier", 1.0))
        if not folder or not title:
            self._send_json(400, {"success": False, "error": "缺少必要字段 (folder, title)"})
            return

        # Detect images
        image_info = scanner.detect_images(folder)
        v_image_map = scanner.match_variant_images(image_info["variantImages"], variants)

        # Get next ID
        id_info = store_writer.get_next_id()
        pid = id_info["id"]
        print(f"[INFO] 上架 {pid}: {title}")

        # Process images
        processed = image_processor.process_product_images(pid, folder, {
            **image_info,
            "variantImages": v_image_map,
        })

        # Build variants
        now = __import__("datetime").datetime.now().strftime("%Y-%m-%d")
        product_variants = []
        for v in variants:
            vkey = v.get("sku_id") or v.get("name", "")
            vimg = processed["variantImages"].get(vkey, "")
                        v["price"] = round(v["price"] * multiplier, 2)
            if v.get("original_price"):
                v["original_price"] = round(v["original_price"] * multiplier, 2)
                    product_variants.append({
                "name_zhCN": v.get("name", ""),
                "name_zhTW": scanner.to_zh_tw(v.get("name", "")),
                "price": v.get("price", 0),
                "originalPrice": v.get("original_price") if v.get("original_price", 0) > v.get("price", 0) else None,
                "stock": 50,
                "image": vimg,
                "sku": v.get("sku_id", ""),
            })

        # Generate entry
        entry = store_writer.generate_product_entry({
            "id": pid, "slug": slug,
            "title_zhCN": title, "title_zhTW": scanner.to_zh_tw(title),
            "description_zhCN": "",
            "description_zhTW": "",
            "price": price or (min(v["price"] for v in product_variants) if product_variants else 0),
            "originalPrice": max(v.get("originalPrice") or v["price"] for v in product_variants) if product_variants else None,
            "images": processed["images"], "category": category,
            "shape": shape or "", "inStock": True, "stock": 100,
            "specs": specs, "createdAt": now,
            "variants": product_variants, "detailImages": processed["detailImages"],
            "sourceUrl": source_url or "", "sourceSku": item_id or "",
            "videos": processed["videos"],
        })

        # Write to products.ts
        store_writer.append_product_to_ts(entry)

        # Update source_products.json
        store_writer.update_source_json({
            "id": pid, "slug": slug, "sourceSku": item_id or "", "sourceUrl": source_url or "",
            "category": category,
            "title_zhCN": title, "title_zhTW": scanner.to_zh_tw(title),
            "variants": product_variants, "images": processed["images"],
            "videos": processed["videos"], "specs": specs,
        })

        self._send_json(200, {
            "success": True, "productId": pid,
            "message": f"产品 {pid} ({title}) 上架成功！",
            "data": {
                "id": pid,
                "images": len(processed["images"]),
                "detailImages": len(processed["detailImages"]),
                "variants": len(product_variants),
                "videos": len(processed["videos"]),
            },
        })

    def _handle_list_products(self):
        ids = store_writer.get_current_product_ids()
        products = []
        if os.path.isfile(SOURCE_JSON_PATH):
            with open(SOURCE_JSON_PATH, "r", encoding="utf-8") as f:
                for p in json.load(f).get("products", []):
                    products.append({
                        "id": p["id"], "title": p.get("title_zhCN", ""),
                        "sourceSku": p.get("source_sku", ""),
                        "images": len(p.get("images", [])),
                        "variants": len(p.get("variants", [])),
                        "date_uploaded": p.get("date_uploaded", ""),
                    })
        self._send_json(200, {"success": True, "products": products, "total": len(products)})

    def _handle_preview_image(self, params):
        folder = params.get("folder", [None])[0]
        file = params.get("file", [None])[0]
        if not folder or not file:
            self._send_json(400, {"success": False, "error": "Missing params"})
            return
        full_path = os.path.join(folder, file)
        if not os.path.isfile(full_path):
            self._send_json(404, {"success": False, "error": "File not found"})
            return

        # Determine content type
        ctype, _ = mimetypes.guess_type(full_path)
        if not ctype:
            ctype = "application/octet-stream"

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", os.path.getsize(full_path))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        with open(full_path, "rb") as f:
            self.wfile.write(f.read())

    # ===== Utilities =====

    def _send_json(self, status, data):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def _serve_static(self, filename):
        filepath = os.path.join(TEMPLATES_DIR, filename)
        if not os.path.isfile(filepath):
            self._send_json(404, {"success": False, "error": f"File not found: {filename}"})
            return

        ctype, _ = mimetypes.guess_type(filepath)
        if not ctype:
            ctype = "text/html"

        with open(filepath, "rb") as f:
            content = f.read()

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", len(content))
        self.end_headers()
        self.wfile.write(content)

    def _handle_set_dirs(self, data):
        dirs = data.get("dirs", [])
        if not dirs: self._send_json(400, {"success": False, "error": "no dirs"}); return
        scanner.set_source_dirs(dirs)
        self._send_json(200, {"success": True})

    def _handle_scan_custom(self, data):
        dirs = data.get("dirs", [])
        if not dirs: self._send_json(400, {"success": False, "error": "no dirs"}); return
        scanner.set_source_dirs(dirs)
        self._handle_scan()

    def _handle_auto_upload(self, data):
        custom_dirs = data.get("dirs", None)
        all_folders = scanner.find_product_folders(custom_dirs)
        if not all_folders:
            self._send_json(400, {"success": False, "error": "no folders"})
            return
        sp = []
        if os.path.isfile(SOURCE_JSON_PATH):
            sp = json.load(open(SOURCE_JSON_PATH, "r", encoding="utf-8")).get("products", [])
        results, errors, uploaded = [], [], 0
        for folder in all_folders:
            self._do_upload_one(folder, sp, results, errors)
            uploaded = sum(1 for r in results if r.get("status") == "ok")
        self._send_json(200, {"success": True, 
            "total": len(all_folders), "uploaded": uploaded,
            "skipped": len(all_folders) - uploaded - len(errors),
            "errors": len(errors), "results": results, "errorDetails": errors[:5]})

    def _do_upload_one(self, folder, sp, results, errors):
        pd = scanner.parse_page_data(folder)
        if not pd or not pd.get("title"):
            errors.append({"folder": folder, "error": "no data"})
            return
        title = pd["title"]; slug = scanner.pinyinify(title)
        if any(p.get("title_zhCN") == title or p.get("slug") == slug for p in sp):
            results.append({"title": title, "status": "skipped"})
            return
        try:
            self._upload_single(pd, title, slug, folder)
            results.append({"title": title, "status": "ok"})
        except Exception as e:
            import traceback; traceback.print_exc()
            errors.append({"title": title, "error": str(e)})

    def _upload_single(self, pd, title, slug, folder):
        ii = scanner.detect_images(folder)
        vd = pd.get("variants", [])
        vm = scanner.match_variant_images(ii["variantImages"], vd)
        id_info = store_writer.get_next_id()
        pid = id_info["id"]
        processed = image_processor.process_product_images(pid, folder, {**ii, "variantImages": vm})
        now = __import__("datetime").datetime.now().strftime("%Y-%m-%d")
        pv = []
        for v in vd:
            vkey = v.get("sku_id") or v.get("name", "")
            vimg = processed.get("variantImages", {}).get(vkey, "")
            pv.append({
                "name_zhCN": v.get("name", ""),
                "name_zhTW": scanner.to_zh_tw(v.get("name", "")),
                "price": v.get("price", 0),
                "originalPrice": v.get("original_price") if v.get("original_price", 0) > v.get("price", 0) else None,
                "stock": 50,
                "image": vimg,
                "sku": v.get("sku_id", ""),
            })
        price = pd.get("price", 0) or (min(vi["price"] for vi in pv) if pv else 0)
        orig = max(vi.get("originalPrice") or vi["price"] for vi in pv) if pv else None
        entry = store_writer.generate_product_entry({
            "id": pid,
            "slug": slug,
            "title_zhCN": title,
            "title_zhTW": scanner.to_zh_tw(title),
            "description_zhCN": "",
            "description_zhTW": "",
            "price": price,
            "originalPrice": orig,
            "images": processed.get("images", []),
            "category": scanner.detect_category(title),
            "shape": scanner.detect_shape(title) or "",
            "inStock": True,
            "stock": 100,
            "specs": pd.get("specs", {}),
            "createdAt": now,
            "variants": pv,
            "detailImages": processed.get("detailImages", []),
            "sourceUrl": pd.get("sourceUrl", ""),
            "sourceSku": pd.get("itemId", ""),
            "videos": processed.get("videos", []),
        })
        store_writer.append_product_to_ts(entry)
        store_writer.update_source_json({
            "id": pid,
            "slug": slug,
            "sourceSku": pd.get("itemId", ""),
            "sourceUrl": pd.get("sourceUrl", ""),
            "category": scanner.detect_category(title),
            "title_zhCN": title,
            "title_zhTW": scanner.to_zh_tw(title),
            "variants": pv,
            "images": processed.get("images", []),
            "videos": processed.get("videos", []),
            "specs": pd.get("specs", {}),
        })

    def log_message(self, format, *args):
        """Suppress default logging"""
        msg = format % args
        if not msg.startswith("GET /api/"):
            print(f"[HTTP] {msg}")


if __name__ == "__main__":
    print(f"\n{'=' * 40}")
    print(f"  紫砂壶上架工具 v2.0 (Python)")
    print(f"  Running on http://localhost:{PORT}")
    print(f"{'=' * 40}\n")

    server = HTTPServer(("0.0.0.0", PORT), UploaderHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] 服务器停止")
        server.server_close()
