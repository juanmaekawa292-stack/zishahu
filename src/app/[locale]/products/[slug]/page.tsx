import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/data/products";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const product = getProductBySlug(slug);
  const locale = await getLocale();

  if (!product) {
    return { title: "商品未找到" };
  }

  const title = locale === "zh-TW" ? product.title_zhTW : product.title_zhCN;
  const description =
    locale === "zh-TW" ? product.description_zhTW : product.description_zhCN;
  const cleanDesc = description.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title,
    description: cleanDesc,
    openGraph: {
      title: `${title} | 紫砂壶`,
      description: cleanDesc,
      images: product.images.length > 0
        ? [{ url: product.images[0], width: 800, height: 800 }]
        : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | 紫砂壶`,
      description: cleanDesc,
      images: product.images.length > 0 ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const locale = await getLocale();
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: locale === "zh-TW" ? product.title_zhTW : product.title_zhCN,
    description:
      (locale === "zh-TW"
        ? product.description_zhTW
        : product.description_zhCN
      ).replace(/<[^>]*>/g, ""),
    image: product.images.map(
      (img) => `https://zisha.hu${img.startsWith("/") ? "" : "/"}${img}`
    ),
    sku: product.id,
    mpn: product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    brand: {
      "@type": "Brand",
      name: "紫砂壶",
    },
    ...(product.specs.clay
      ? { material: product.specs.clay }
      : {}),
    ...(product.specs.capacity
      ? { size: product.specs.capacity }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailContent product={product} />

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            {product.category === "teapot" ? "相关推荐" : "同类推荐"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
