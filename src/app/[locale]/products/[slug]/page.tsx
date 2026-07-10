import { notFound } from "next/navigation";
import { getProducts, getProductBySlug } from "@/lib/runtime-products";
import type { Product } from "@/types";
import type { Metadata } from "next";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { EditProductButton } from "@/components/product/EditProductButton";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductMeta } from "@/components/seo/ProductMeta";
import { generateProductMeta } from "@/lib/seo";
import { getProductTitle } from "@/lib/product-locale"
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const _params = await params;
  const slug = _params?.slug || "";
  const locale = _params?.locale || "zh-CN";

  let product = await getProductBySlug(slug);
  if (!product) {
    try {
      const decoded = decodeURIComponent(slug);
      product = await getProductBySlug(decoded);
    } catch (e) {}
  }

  if (!product) {
    return { title: "商品未找到" };
  }

  const p: Product = product;
  const meta = generateProductMeta(p, locale);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: [{
        url: meta.image,
        width: 800,
        height: 800,
        alt: getProductTitle(p, locale),
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  var _params = await params;
  var slug = _params?.slug || "";
  var locale = await getLocale() || "zh-CN";
  
  // Try both raw and decoded
  var product = await getProductBySlug(slug);
  if (!product) {
    try {
      var decoded = decodeURIComponent(slug);
      product = await getProductBySlug(decoded);
    } catch(e) {}
  }
  
  if (!product) { 
    notFound();
    return; 
  }

  var p: Product = product;
  var allProducts = await getProducts();
  var relatedProducts = allProducts
    .filter(function(x: { category: string; id: string }) { return x.category === p.category && x.id !== p.id; })
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductMeta product={p} locale={locale} />
      <div className="flex justify-end mb-4">
        <EditProductButton productId={p.id} />
      </div>
      <ProductDetailContent product={p} />
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            {p.category === "teapot" ? "相关推荐" : "同类推荐"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map(function(rp: { id: string }) {
              return <ProductCard key={rp.id} product={rp as any} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}

