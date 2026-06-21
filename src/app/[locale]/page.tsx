import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { HomeCarousel } from "@/components/product/HomeCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { ArrowRight, Shield, Truck, RefreshCw } from "lucide-react";

const categoryCards = [
  { key: "teapot", emoji: "🫖", name: "??ɰ??", count: products.filter((p) => p.category === "teapot").length },
  { key: "cup", emoji: "🍵", name: "?豭", count: products.filter((p) => p.category === "cup").length },
  { key: "teaPet", emoji: "🦊", name: "???", count: products.filter((p) => p.category === "teaPet").length },
  { key: "teaTool", emoji: "🔧", name: "??????", count: products.filter((p) => p.category === "teaTool").length },
  { key: "gift", emoji: "🎁", name: "??Ʒ??װ", count: products.filter((p) => p.category === "gift").length },
];

export default function HomePage() {
  const t = useTranslations("common");
  const featuredProducts = products.filter((p) => p.featured);
  const newProducts = products
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
  const topRated = products
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
  const shapes = [
    ...new Set(products.filter((p) => p.specs.shapeType).map((p) => p.specs.shapeType as string)),
  ];

  return (
    <div>
      <HomeCarousel />

      {/* Features Section */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">ȫ?????</h3>
                <p className="text-sm text-muted-foreground">??$99???˷ѣ???ȫ?ʹ?</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Ʒ?ʱ???</h3>
                <p className="text-sm text-muted-foreground">ԭ????ɰ???ֹ?????</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">?????˻?</h3>
                <p className="text-sm text-muted-foreground">30???˻???????ѡ??</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Browse */}
      <section>
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">???????</h2>
            <p className="mt-1 text-sm text-muted-foreground">??Ʒ??????ҵ????ǵ???ɰ??Ʒ</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categoryCards.map((cat) => (
              <Link
                key={cat.key}
                href={`/products?category=${cat.key}`}
                className="group flex flex-col items-center rounded-xl border bg-background p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="mb-3 text-4xl transition-transform group-hover:scale-110">{cat.emoji}</span>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
                <span className="mt-1 text-xs text-muted-foreground">{cat.count} ????Ʒ</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">热销排行</h2>
              <p className="mt-1 text-sm text-muted-foreground">评分最高的热门紫砂作品</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {topRated.map((product) => (
              <div key={product.id} className="relative">
                {product.rating > 4.9 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      HOT
                    </span>
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shape Gallery */}
      {shapes.length > 0 && (
        <section>
          <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">壶型速览</h2>
              <p className="mt-1 text-sm text-muted-foreground">按壶型筛选，找到你喜欢的款式</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {shapes.map((shape) => (
                <Link
                  key={shape}
                  href={"/products?shape=" + encodeURIComponent(shape)}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {shape}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">????????</h2>
              <p className="mt-1 text-sm text-muted-foreground">??????ߵ???????ɰ??Ʒ</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {topRated.map((product, index) => (
              <div key={product.id} className="relative">
                {product.rating > 4.9 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      HOT
                    </span>
                  </div>
                )}
                <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow">
                  {index + 1}
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shape Quick View */}
      <section>
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">????????</h2>
            <p className="mt-1 text-sm text-muted-foreground">?????????̽????ɰ????</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {shapes.map((shape) => (
              <Link
                key={shape}
                href={`/products?shape=${encodeURIComponent(shape!)}`}
                className="inline-flex items-center rounded-full border bg-background px-5 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-sm"
              >
                {shape}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("featured")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">??ѡ??????ɰ??Ʒ</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {t("viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="relative">
                {product.rating > 4.9 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      HOT
                    </span>
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("newArrivals")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">?????ϼܵ???ɰ??Ʒ</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {newProducts.map((product) => (
              <div key={product.id} className="relative">
                {product.rating > 4.9 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      HOT
                    </span>
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 sm:p-12">
          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              ?????????ɰ֮??
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 max-w-lg mx-auto">
              ÿһ?Ѻ??????Լ????Ը??ҵ?????????????һ?ѡ?
              ע???Ϊ??Ա??????ר???Żݺ???????Ʒ֪ͨ??
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-primary hover:bg-white/90 transition-colors shadow-lg"
              >
                {t("register")}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-white/10 transition-colors"
              >
                {t("viewAll")}
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/4 rounded-full bg-white/5" />
        </div>
      </section>
    </div>
  );
}