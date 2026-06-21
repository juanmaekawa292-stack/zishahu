import type { Product } from "@/types";
import { products } from "@/data/products";

const BASE_URL = "https://zisha.hu";
const SITE_NAME = "紫砂雅集";

const categoryLabels: Record<string, string> = {
  teapot: "紫砂壶",
  cup: "茶杯",
  teaPet: "茶宠",
  teaTool: "茶具配件",
  gift: "礼品套装",
};

/**
 * Generate SEO metadata for a product page.
 */
export function generateProductMeta(product: Product, locale: string) {
  const isZhTW = locale === "zh-TW";
  const title = product.metaTitle || (isZhTW ? product.title_zhTW : product.title_zhCN);
  const description =
    product.metaDescription ||
    (isZhTW
      ? product.description_zhTW.substring(0, 155)
      : product.description_zhCN.substring(0, 155));

  // Collect keywords from specs + category + shape
  const keywords: string[] = [];
  const catLabel = categoryLabels[product.category];
  if (catLabel) keywords.push(catLabel);
  if (product.shape) keywords.push(product.shape);
  if (product.specs?.material) keywords.push(product.specs.material);
  if (product.specs?.clay) keywords.push(product.specs.clay);
  if (product.specs?.craft) keywords.push(product.specs.craft);
  if (product.specs?.origin) keywords.push(product.specs.origin);

  const productKeywords = product.seoKeywords || [];
  const allKeywords = [...new Set([...keywords, ...productKeywords])];

  const image = product.images?.[0]
    ? product.images[0]
    : BASE_URL + "/og-default.jpg";

  return {
    title: title + " | " + SITE_NAME,
    description,
    keywords: allKeywords,
    image,
  };
}

/**
 * Generate JSON-LD structured data (Product schema) for a product page.
 */
export function generateProductJsonLd(product: Product, locale: string) {
  const isZhTW = locale === "zh-TW";
  const title = isZhTW ? product.title_zhTW : product.title_zhCN;
  const description = isZhTW
    ? product.description_zhTW.substring(0, 300)
    : product.description_zhCN.substring(0, 300);

  const image = product.images?.[0] || "";
  const offerPrice = product.price;
  const offerCurrency = "USD";
  const availability = product.inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const brandName = "紫砂雅集";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: product.images,
    sku: product.sourceSku || product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: BASE_URL + "/" + product.slug,
      priceCurrency: offerCurrency,
      price: offerPrice,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // Add aggregateRating if there are reviews
  if (product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  // Add category
  const catLabels: Record<string, string> = {
    teapot: "紫砂壶",
    cup: "茶杯",
    teaPet: "茶宠",
    teaTool: "茶具配件",
    gift: "礼品套装",
  };
  if (catLabels[product.category]) {
    schema.category = catLabels[product.category];
  }

  return schema;
}

/**
 * Generate BreadcrumbList JSON-LD for a product page.
 */
export function generateBreadcrumbJsonLd(
  product: Product,
  locale: string
) {
  const isZhTW = locale === "zh-TW";
  const catLabel: Record<string, string> = {
    teapot: isZhTW ? "紫砂壺" : "紫砂壶",
    cup: isZhTW ? "茶杯" : "茶杯",
    teaPet: isZhTW ? "茶寵" : "茶宠",
    teaTool: isZhTW ? "茶具配件" : "茶具配件",
    gift: isZhTW ? "禮品套裝" : "礼品套装",
  };

  const title = isZhTW ? product.title_zhTW : product.title_zhCN;
  const localePrefix = locale === "zh-CN" ? "" : "/" + locale;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: BASE_URL + localePrefix,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: catLabel[product.category] || "商品",
        item: BASE_URL + localePrefix + "/products?category=" + product.category,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: BASE_URL + localePrefix + "/" + product.slug,
      },
    ],
  };
}

/**
 * Get total product count for sitemap.
 */
export function getProductCount(): number {
  return products.length;
}
