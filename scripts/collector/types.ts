/**
 * 采集器专用的类型定义
 * TmallRawProduct → 天猫原始数据类型
 * 最终映射到 src/types/index.ts 的 Product 接口
 */

/** SKU 规格项：容量/泥料/工艺/尺寸 */
export interface SkuOption {
  label: string;
  value: string;
}

/** 单个 SKU */
export interface SkuItem {
  id: string;
  specs: SkuOption[];
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
}

/** 详情描述图片 */
export interface DetailImage {
  url: string;
  alt?: string;
  index: number;
}

/** 天猫采集的原始商品数据 */
export interface TmallRawProduct {
  tmallId: string;
  collectedAt: string;
  title: string;
  price: number;
  originalPrice?: number;
  mainImages: string[];
  detailImages: DetailImage[];
  /** 商品视频链接列表 */
  videos?: string[];
  skus: SkuItem[];
  reviewCount: number;
  salesCount?: number;
  shopName?: string;
  productUrl: string;
  /** 天猫货号 */
  sourceSku?: string;
  /** 店铺名称（采集用） */
  shopUrl?: string;
  category?: string;
}

/** 采集配置 */
export interface CollectorConfig {
  keywords: string[];
  maxProducts: number;
  headless: boolean;
  minDelay: number;
  maxDelay: number;
  proxy?: string;
  timeout: number;
  outputDir: string;
}

/** 采集结果汇总 */
export interface CollectResult {
  success: number;
  failed: number;
  skipped: number;
  errors: { tmallId: string; message: string }[];
  duration: number;
}

/** 增量采集索引 */
export interface CollectionIndex {
  lastUpdated: string;
  collectedIds: string[];
  totalCollected: number;
}
