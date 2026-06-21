import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blog";

const BASE_URL = "https://zisha.hu";

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
    url: BASE_URL + "/" + product.slug,
    lastModified: product.createdAt,
    changeFrequency: "weekly" as const,
    priority: product.featured ? 0.9 : 0.8,
    alternates: {
      languages: {
        "zh-TW": BASE_URL + "/zh-TW/" + product.slug,
      },
    },
  }));

  const staticPageEntries = staticPages.map((page) => ({
    url: BASE_URL + page,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "monthly" as const,
    priority: page === "" ? 1.0 : 0.6,
    alternates: page === ""
      ? {
          languages: {
            "zh-TW": BASE_URL + "/zh-TW",
          },
        }
      : {
          languages: {
            "zh-TW": BASE_URL + "/zh-TW" + page,
          },
        },
  }));

  const blogPages = blogPosts.filter(Boolean).map((post) => ({
    url: BASE_URL + "/blog/" + post.slug,
    lastModified: post.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        "zh-TW": BASE_URL + "/zh-TW/blog/" + post.slug,
      },
    },
  }));

  const blogIndexPage = {
    url: BASE_URL + "/blog",
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        "zh-TW": BASE_URL + "/zh-TW/blog",
      },
    },
  };

  // Total: 1 (home) + 7 static + productPages + 1 blog index + blogPages entries
  return [...staticPageEntries, ...productPages, blogIndexPage, ...blogPages];
}
