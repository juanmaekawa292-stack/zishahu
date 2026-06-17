import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { ProductCard } from "@/components/product/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  var slug = params?.slug || "";
  var _product = getProductBySlug(slug);
  if (!_product) { notFound(); return null; }
  var product = _product;

  var relatedProducts = products
    .filter(function(p) { return p.category === product.category && p.id !== product.id; })
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetailContent product={product} />
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            {product.category === "teapot" ? "相关推荐" : "同类推荐"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map(function(rp) {
              return <ProductCard key={rp.id} product={rp} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
