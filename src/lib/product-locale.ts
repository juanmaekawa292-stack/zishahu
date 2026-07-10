import type { Product, ProductVariant } from "@/types";

export function getProductTitle(product: Product, locale: string): string {
  if (locale === "en" && product.title_en) return product.title_en;
  if (locale === "zh-TW") return product.title_zhTW;
  return product.title_zhCN;
}

export function getProductDescription(product: Product, locale: string): string {
  if (locale === "en" && product.description_en) return product.description_en;
  if (locale === "zh-TW") return product.description_zhTW;
  return product.description_zhCN;
}

export function getVariantName(variant: ProductVariant, locale: string): string {
  if (locale === "en" && variant.name_en) return variant.name_en;
  if (locale === "zh-TW") return variant.name_zhTW;
  return variant.name_zhCN;
}

export function getCategoryLabel(category: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    en: { teapot: "Yixing Teapot", cup: "Tea Cup", teaPet: "Tea Pet", teaTool: "Tea Tool", gift: "Gift Set" },
    "zh-TW": { teapot: "紫砂壺", cup: "茶杯", teaPet: "茶寵", teaTool: "茶具配件", gift: "禮品套裝" },
    "zh-CN": { teapot: "紫砂壶", cup: "茶杯", teaPet: "茶宠", teaTool: "茶具配件", gift: "礼品套装" },
  };
  return labels[locale]?.[category] || labels["zh-CN"][category] || category;
}

export function getSpecLabel(specKey: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      firingType: "Firing Type", capacity: "Capacity", material: "Material", origin: "Origin",
      handmade: "Craftsmanship", shapeType: "Shape", packaging: "Packaging", kiln: "Kiln",
      year: "Year", color: "Color", clay: "Clay Type", craft: "Craft",
      dimensions: "Dimensions", scenario: "Scenario", cleaning: "Cleaning",
      suitableTea: "Best For", mainImageSource: "Image Source",
    },
    "zh-TW": {
      firingType: "燒製窯型", capacity: "容量", material: "材質", origin: "產地",
      handmade: "是否手工", shapeType: "壺型", packaging: "包裝形式", kiln: "窯系",
      year: "年代/年份", color: "顏色分類", clay: "泥料", craft: "工藝",
      dimensions: "尺寸", scenario: "適用場景", cleaning: "清洗方式",
      suitableTea: "適合茶類", mainImageSource: "主圖來源",
    },
    "zh-CN": {
      firingType: "烧制窑型", capacity: "容量", material: "材质", origin: "产地",
      handmade: "是否手工", shapeType: "壶型", packaging: "包装形式", kiln: "窑系",
      year: "年代/年份", color: "颜色分类", clay: "泥料", craft: "工艺",
      dimensions: "尺寸", scenario: "适用场景", cleaning: "清洗方式",
      suitableTea: "适合茶类", mainImageSource: "主图来源",
    },
  };
  return labels[locale]?.[specKey] || labels["zh-CN"][specKey] || specKey;
}
