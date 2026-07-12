import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blog";

const BASE_URL = "https://zishapro.com";

const staticPages = [
  "",
  "/products",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/faq",
  "/help",
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Product pages with priority based on featured status
  const productPages = products.filter(Boolean).map((product) => ({
    url: BASE_URL + "/zh-CN/products/" + product.slug,
    lastModified: product.createdAt,
    changeFrequency: "weekly" as const,
    priority: product.featured ? 0.9 : 0.8,
    alternates: {
      languages: {
        "zh-CN": BASE_URL + "/zh-CN/products/" + product.slug,
        "zh-TW": BASE_URL + "/zh-TW/products/" + product.slug,
        en: BASE_URL + "/en/products/" + product.slug,
      },
    },
  }));

  const staticPageEntries = staticPages.map((page) => ({
    url: BASE_URL + "/zh-CN" + page,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "monthly" as const,
    priority: page === "" ? 1.0 : 0.6,
    alternates: page === ""
      ? {
          languages: {
            "zh-CN": BASE_URL + "/zh-CN",
            "zh-TW": BASE_URL + "/zh-TW",
            en: BASE_URL + "/en",
          },
        }
      : {
          languages: {
            "zh-CN": BASE_URL + "/zh-CN" + page,
            "zh-TW": BASE_URL + "/zh-TW" + page,
            en: BASE_URL + "/en" + page,
          },
        },
  }));

  const blogPages = blogPosts.filter(Boolean).map((post) => ({
    url: BASE_URL + "/zh-CN/blog/" + post.slug,
    lastModified: post.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        "zh-CN": BASE_URL + "/zh-CN/blog/" + post.slug,
        "zh-TW": BASE_URL + "/zh-TW/blog/" + post.slug,
        en: BASE_URL + "/en/blog/" + post.slug,
      },
    },
  }));

  const blogIndexPage = {
    url: BASE_URL + "/zh-CN/blog",
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        "zh-CN": BASE_URL + "/zh-CN/blog",
        "zh-TW": BASE_URL + "/zh-TW/blog",
        en: BASE_URL + "/en/blog",
      },
    },
  };

  // Total: 1 (home) + 7 static + productPages + 1 blog index + blogPages entries
  return [...staticPageEntries, ...productPages, blogIndexPage, ...blogPages];
}
