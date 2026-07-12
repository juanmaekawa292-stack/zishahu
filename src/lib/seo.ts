import type { Product } from "@/types";
import { products } from "@/data/products";

 const BASE_URL = "https://zishapro.com";
const SITE_NAME = "紫砂雅集";
const SITE_NAME_EN = "ZishaHu";

const categoryLabels: Record<string, string> = {
  teapot: "紫砂壶",
  cup: "茶杯",
  teaPet: "茶宠",
  teaTool: "茶具配件",
  gift: "礼品套装",
};
const categoryLabelsEN: Record<string, string> = {
  teapot: "Yixing Zisha Teapot",
  cup: "Zisha Tea Cup",
  teaPet: "Yixing Tea Pet",
  teaTool: "Tea Set Accessory",
  gift: "Gift Set",
};

export function generateProductMeta(product: Product, locale: string) {
  const isZhTW = locale === "zh-TW";
  const isEN = locale === "en";
  const title = product.metaTitle || (isEN ? product.title_en : isZhTW ? product.title_zhTW : product.title_zhCN);
  const description = product.metaDescription || (isEN ? (product.description_en || "").substring(0, 155) : isZhTW ? product.description_zhTW.substring(0, 155) : product.description_zhCN.substring(0, 155));
  const keywords: string[] = [];
  const catLabel = isEN ? categoryLabelsEN[product.category] : categoryLabels[product.category];
  if (catLabel) keywords.push(catLabel);
  if (product.shape) keywords.push(product.shape);
  const sp = isEN && product.specs_en ? product.specs_en : product.specs;
  if (sp?.material) keywords.push(sp.material);
  if (sp?.clay) keywords.push(sp.clay);
  if (sp?.craft) keywords.push(sp.craft);
  if (sp?.origin) keywords.push(sp.origin);
  const productKeywords = product.seoKeywords || [];
  const allKeywords = [...new Set([...keywords, ...productKeywords])];
  const image = product.images?.[0] ? product.images[0] : BASE_URL + "/og-default.jpg";
  return { title: title + " | " + (isEN ? SITE_NAME_EN : SITE_NAME), description, keywords: allKeywords, image };
}

export function generateProductJsonLd(product: Product, locale: string) {
  const isZhTW = locale === "zh-TW";
  const isEN = locale === "en";
  const title = isEN ? product.title_en : isZhTW ? product.title_zhTW : product.title_zhCN;
  const description = isEN ? (product.description_en || "").substring(0, 300) : isZhTW ? product.description_zhTW.substring(0, 300) : product.description_zhCN.substring(0, 300);
  const image = product.images?.[0] || "";
  const offerPrice = product.price;
  const offerCurrency = "USD";
  const availability = product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const brandName = isEN ? "ZishaHu" : "紫砂雅集";
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: product.images,
    sku: product.sourceSku || product.id,
    mpn: product.id,
    brand: { "@type": "Brand", name: brandName },
    offers: {
      "@type": "Offer",
      url: BASE_URL + "/" + product.slug,
      priceCurrency: offerCurrency,
      price: offerPrice,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (product.reviewCount > 0) {
    schema.aggregateRating = { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount };
  }
  const catLabels: Record<string, string> = {
    teapot: isEN ? "Yixing Zisha Teapot" : "紫砂壶",
    cup: isEN ? "Zisha Tea Cup" : "茶杯",
    teaPet: isEN ? "Yixing Tea Pet" : "茶宠",
    teaTool: isEN ? "Tea Set Accessory" : "茶具配件",
    gift: isEN ? "Gift Set" : "礼品套装",
  };
  if (catLabels[product.category]) {
    schema.category = catLabels[product.category];
  }
  return schema;
}

export function generateBreadcrumbJsonLd(product: Product, locale: string) {
  const isZhTW = locale === "zh-TW";
  const isEN = locale === "en";
  const catLabelZh: Record<string, string> = {
    teapot: isZhTW ? "紫砂壺" : "紫砂壶",
    cup: isZhTW ? "茶杯" : "茶杯",
    teaPet: isZhTW ? "茶寵" : "茶宠",
    teaTool: isZhTW ? "茶具配件" : "茶具配件",
    gift: isZhTW ? "禮品套裝" : "礼品套装",
  };
  const catLabelEn: Record<string, string> = {
    teapot: "Yixing Zisha Teapot",
    cup: "Zisha Tea Cup",
    teaPet: "Yixing Tea Pet",
    teaTool: "Tea Set Accessory",
    gift: "Gift Set",
  };
  const catLabel = isEN ? catLabelEn : catLabelZh;
  const title = isEN ? product.title_en : isZhTW ? product.title_zhTW : product.title_zhCN;
  const localePrefix = locale === "zh-CN" ? "" : "/" + locale;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isEN ? "Home" : "首页", item: BASE_URL + localePrefix },
      { "@type": "ListItem", position: 2, name: catLabel[product.category] || (isEN ? "Products" : "商品"), item: BASE_URL + localePrefix + "/products?category=" + product.category },
      { "@type": "ListItem", position: 3, name: title, item: BASE_URL + localePrefix + "/" + product.slug },
    ],
  };
}

export function getProductCount(): number {
  return products.length;
}
