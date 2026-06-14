import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "tk-001",
    slug: "guishou-zisha-teaset",
    title_zhCN: "宜兴紫砂壶 纯手工功夫茶具 归兽壶 套装",
    title_zhTW: "宜興紫砂壺 純手工功夫茶具 歸獸壺 套裝",
    description_zhCN: "",
    description_zhTW: "",
    price: 339,
    originalPrice: 399,
    images: ["/images/products/guishou-zisha-teaset-1.webp","/images/products/guishou-zisha-teaset-2.webp","/images/products/guishou-zisha-teaset-3.webp","/images/products/guishou-zisha-teaset-4.webp","/images/products/guishou-zisha-teaset-5.webp","/images/products/guishou-zisha-teaset-6.webp"],
    category: "teapot",
    inStock: true,
    stock: 100,
    featured: true,
    specs: {"capacity":"约200ml","clay":"原矿紫泥","craft":"全手工制作"},
    createdAt: "2026-06-14",
    rating: 4.8,
    reviewCount: 0,
    sourceUrl: "https://item.taobao.com/item.htm?id=561562722621",
    sourceSku: "561562722621",
    videos: [],
  },
  {
    id: "tk-002",
    slug: "shipiao-zisha-teaset",
    title_zhCN: "宜兴紫砂壶 全手工功夫茶具 经典石瓢壶 套装",
    title_zhTW: "宜興紫砂壺 全手工功夫茶具 經典石瓢壺 套裝",
    description_zhCN: "",
    description_zhTW: "",
    price: 299,
    originalPrice: 439,
    images: ["/images/products/shipiao-zisha-teaset-1.webp","/images/products/shipiao-zisha-teaset-2.webp","/images/products/shipiao-zisha-teaset-3.webp","/images/products/shipiao-zisha-teaset-4.webp","/images/products/shipiao-zisha-teaset-5.webp","/images/products/shipiao-zisha-teaset-6.webp","/images/products/shipiao-zisha-teaset-7.webp","/images/products/shipiao-zisha-teaset-8.webp","/images/products/shipiao-zisha-teaset-9.webp","/images/products/shipiao-zisha-teaset-10.webp","/images/products/shipiao-zisha-teaset-11.webp"],
    category: "teapot",
    inStock: true,
    stock: 100,
    featured: false,
    specs: {"capacity":"约240ml","clay":"原矿紫泥","craft":"全手工制作"},
    createdAt: "2026-06-14",
    rating: 4.8,
    reviewCount: 0,
    sourceUrl: "https://detail.tmall.com/item.htm?id=36037405367",
    sourceSku: "36037405367",
    videos: ["/videos/products/tk-002.mp4"],
  },
];

export const categories = [
  { key: "all", label_zhCN: "全部" },
  { key: "teapot", label_zhCN: "紫砂壶" },
  { key: "cup", label_zhCN: "茶杯" },
  { key: "teaPet", label_zhCN: "茶宠" },
  { key: "teaTool", label_zhCN: "茶具配件" },
  { key: "gift", label_zhCN: "礼品套装" },
];

export function getProductBySlug(slug: string) {
  return products.find(function(p) { return p.slug === slug; });
}

export function getProductById(id: string) {
  return products.find(function(p) { return p.id === id; });
}

export const countries = [
  { code: "US", name_zhCN: "美国", name_zhTW: "美國" },
  { code: "CA", name_zhCN: "加拿大", name_zhTW: "加拿大" },
  { code: "GB", name_zhCN: "英国", name_zhTW: "英國" },
  { code: "AU", name_zhCN: "澳大利亚", name_zhTW: "澳大利亞" },
  { code: "SG", name_zhCN: "新加坡", name_zhTW: "新加坡" },
  { code: "MY", name_zhCN: "马来西亚", name_zhTW: "馬來西亞" },
  { code: "TW", name_zhCN: "台湾", name_zhTW: "台灣" },
  { code: "HK", name_zhCN: "香港", name_zhTW: "香港" },
  { code: "DE", name_zhCN: "德国", name_zhTW: "德國" },
  { code: "FR", name_zhCN: "法国", name_zhTW: "法國" },
  { code: "JP", name_zhCN: "日本", name_zhTW: "日本" },
  { code: "KR", name_zhCN: "韩国", name_zhTW: "韓國" },
];
