import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import type { Product } from "@/types";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { ProductCard } from "@/components/product/ProductCard";

export function generateStaticParams() {
  return products.map(function(p: { slug: string }) { return { slug: p.slug }; });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  var _params = await params;
  var slug = _params?.slug || "";
  
  // Try both raw and decoded
  var product = getProductBySlug(slug);
  if (!product) {
    try {
      var decoded = decodeURIComponent(slug);
      product = getProductBySlug(decoded);
    } catch(e) {}
  }
  
  if (!product) { 
    notFound();
    return; 
  }

  var p: Product = product;
  var relatedProducts = products
    .filter(function(x: { category: string; id: string }) { return x.category === p.category && x.id !== p.id; })
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
