import * as fs from "fs";
import * as path from "path";
import { CollectorConfig, CollectionIndex } from "./types";

/** 默认采集配置 */
export const DEFAULT_CONFIG: CollectorConfig = {
  keywords: ["紫砂壶", "宜兴紫砂壶", "紫砂茶壶", "手工紫砂壶"],
  maxProducts: 20,
  headless: false,
  minDelay: 2000,
  maxDelay: 5000,
  timeout: 30000,
  outputDir: path.resolve(process.cwd(), "data", "raw_products"),
};

/** 加载现有采集索引（增量采集用） */
export function loadIndex(outputDir: string): CollectionIndex {
  const indexPath = path.join(outputDir, ".index.json");
  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, "utf-8");
      return JSON.parse(raw) as CollectionIndex;
    } catch {
      console.warn("[utils] 索引文件损坏，重置索引");
    }
  }
  return {
    lastUpdated: new Date().toISOString(),
    collectedIds: [],
    totalCollected: 0,
  };
}

/** 保存采集索引 */
export function saveIndex(outputDir: string, index: CollectionIndex) {
  const indexPath = path.join(outputDir, ".index.json");
  index.lastUpdated = new Date().toISOString();
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
}

/** 确保输出目录存在 */
export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** 生成 12 位随机 ID（与现有 ID 格式兼容） */
export function generateProductId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/** 从链接提取天猫商品 ID */
export function extractTmallId(url: string): string | null {
  const match = url.match(/id=(\d+)/);
  return match ? match[1] : null;
}

/** 格式化耗时 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

/** 控制台分色输出 */
export function logInfo(msg: string) {
  console.log(`[INFO] ${msg}`);
}

export function logSuccess(msg: string) {
  console.log(`[OK]   ${msg}`);
}

export function logWarn(msg: string) {
  console.log(`[WARN] ${msg}`);
}

export function logError(msg: string) {
  console.log(`[ERR]  ${msg}`);
}
