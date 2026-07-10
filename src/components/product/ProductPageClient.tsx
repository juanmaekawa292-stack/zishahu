"use client";

import { useParams } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductTitle, getProductDescription } from "@/lib/product-locale"
import { useEffect, useState } from "react";

export default function ProductPageClient() {
  const params = useParams();
  const slug = params?.slug as string || "";
  const locale = params?.locale as string || "zh-CN";
  const product = products.find(p => p.slug === slug);
 const [mounted, setMounted] = useState(false);
 
 const specs = locale === "en" && product?.specs_en ? product.specs_en : product?.specs;
 
 useEffect(() => { setMounted(true); }, []);
 
 if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">商品未找到</h1>
        <p className="mt-2 text-muted-foreground">slug: {slug}</p>
        {mounted && params && <p className="mt-1 text-xs text-muted-foreground">params keys: {Object.keys(params).join(", ")}</p>}
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: getProductTitle(product, locale),
    description: getProductDescription(product, locale).replace(/<[^>]*>/g, ""),
    image: product.images,
    sku: product.id,
    mpn: product.id,
    offers: { "@type": "Offer", price: product.price, priceCurrency: "USD", availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" },
   brand: { "@type": "Brand", name: "紫砂壶" },
   ...(specs?.clay ? { material: specs.clay } : {}),
   ...(specs?.capacity ? { size: specs.capacity } : {}),
 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetailContent product={product} />
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            {product.category === "teapot" ? "相关推荐" : "同类推荐"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rp) => (<ProductCard key={rp.id} product={rp} />))}
          </div>
        </section>
      )}
    </div>
  );
}
