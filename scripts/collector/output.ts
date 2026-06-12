import * as fs from "fs";
import * as path from "path";
import { TmallRawProduct, CollectionIndex } from "./types";
import { ensureDir, loadIndex, saveIndex, logSuccess, logWarn } from "./utils";

/** 保存单个商品数据为 JSON 文件 */
export function saveProduct(outputDir: string, product: TmallRawProduct) {
  ensureDir(outputDir);
  const filePath = path.join(outputDir, `${product.tmallId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(product, null, 2), "utf-8");
}

/** 批量保存商品并更新索引 */
export function saveProducts(
  outputDir: string,
  products: TmallRawProduct[]
): CollectionIndex {
  const index = loadIndex(outputDir);

  for (const product of products) {
    saveProduct(outputDir, product);
    if (!index.collectedIds.includes(product.tmallId)) {
      index.collectedIds.push(product.tmallId);
    }
    logSuccess(`已保存: ${product.title} (${product.tmallId})`);
  }

  index.totalCollected = index.collectedIds.length;
  saveIndex(outputDir, index);

  return index;
}

/** 已采集 ID 集合查询（快速查找用） */
export function loadCollectedIds(outputDir: string): Set<string> {
  const index = loadIndex(outputDir);
  return new Set(index.collectedIds);
}

/** 导出所有已采集数据为 JSON 数组（供前端使用） */
export function exportAllAsArray(outputDir: string): TmallRawProduct[] {
  const index = loadIndex(outputDir);
  const products: TmallRawProduct[] = [];

  for (const id of index.collectedIds) {
    const filePath = path.join(outputDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        products.push(JSON.parse(raw));
      } catch (e) {
        logWarn(`读取 ${id}.json 失败，跳过`);
      }
    }
  }

  return products;
}

/** 导出为 CSV 文件（供运营分析用） */
export function exportAsCSV(outputDir: string, csvPath: string) {
  const products = exportAllAsArray(outputDir);
  if (products.length === 0) {
    logWarn("没有数据可导出");
    return;
  }

  const headers = [
    "tmallId", "title", "price", "originalPrice",
    "salesCount", "reviewCount", "shopName", "productUrl",
    "category", "collectedAt",
  ];
  const rows = products.map((p) =>
    headers
      .map((h) => {
        const val = (p as any)[h] ?? "";
        const str = String(val);
        // 转义 CSV
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  fs.writeFileSync(csvPath, "\uFEFF" + csv, "utf-8"); // BOM for Excel
  logSuccess(`CSV 已导出: ${csvPath} (${products.length} 条)`);
}

/** 加载单个商品 */
export function loadProduct(outputDir: string, tmallId: string): TmallRawProduct | null {
  const filePath = path.join(outputDir, `${tmallId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
