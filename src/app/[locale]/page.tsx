import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { HomeCarousel } from "@/components/product/HomeCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { ArrowRight, Shield, Truck, RefreshCw, Star, Sparkles, Flame, Heart } from "lucide-react";

const categoryCards = [
  { key: "teapot", emoji: "🫖", name: "紫砂壶", count: products.filter((p) => p.category === "teapot").length },
  { key: "cup", emoji: "🍵", name: "茶杯", count: products.filter((p) => p.category === "cup").length },
  { key: "teaPet", emoji: "🦊", name: "茶宠", count: products.filter((p) => p.category === "teaPet").length },
  { key: "teaTool", emoji: "🔧", name: "茶具配件", count: products.filter((p) => p.category === "teaTool").length },
  { key: "gift", emoji: "🎁", name: "礼品套装", count: products.filter((p) => p.category === "gift").length },
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

  return (
    <div>
      <HomeCarousel />

      {/* Features Strip - mobile optimized */}
      <section className="border-y border-border/30 bg-muted/20">
        <div className="mx-auto max-w-[1600px] px-3 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-6 scrollbar-none">
            <div className="flex min-w-[200px] sm:min-w-0 shrink-0 items-center gap-3 rounded-lg bg-background p-4 shadow-sm border border-border/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">全球配送</h3>
                <p className="text-xs text-muted-foreground whitespace-nowrap">满，全球送达</p>
              </div>
            </div>
            <div className="flex min-w-[200px] sm:min-w-0 shrink-0 items-center gap-3 rounded-lg bg-background p-4 shadow-sm border border-border/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">品质保证</h3>
                <p className="text-xs text-muted-foreground whitespace-nowrap">原矿紫砂，手工制作</p>
              </div>
            </div>
            <div className="flex min-w-[200px] sm:min-w-0 shrink-0 items-center gap-3 rounded-lg bg-background p-4 shadow-sm border border-border/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">无忧退换</h3>
                <p className="text-xs text-muted-foreground whitespace-nowrap">30天退换，放心选购</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section>
        <div className="mx-auto max-w-[1600px] px-3 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">分类浏览</h2>
            <p className="mt-1 text-sm text-muted-foreground">探索我们的紫砂世界</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categoryCards.map((cat) => (
              <Link
                key={cat.key}
                href={`/products?category=${cat.key}`}
                className="group flex flex-col items-center rounded-xl border border-border/40 bg-background p-5 sm:p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95"
              >
                <span className="mb-2 text-3xl sm:text-4xl transition-transform group-hover:scale-110">{cat.emoji}</span>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
                <span className="mt-1 text-xs text-muted-foreground">{cat.count} 件商品</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Seller - Top Rated */}
      <section className="bg-gradient-to-b from-muted/30 to-transparent">
        <div className="mx-auto max-w-[1600px] px-3 py-12 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">热销排行</h2>
            </div>
            <Link
              href="/products?sort=rating"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {topRated.map((product, idx) => (
              <div key={product.id} className="relative">
                {idx < 3 && (
                  <div className="absolute -top-1.5 -left-1.5 z-10">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-[11px] font-bold text-white shadow-lg">
                      {idx + 1}
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
      <section>
        <div className="mx-auto max-w-[1600px] px-3 py-12 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t("newArrivals")}</h2>
            </div>
            <Link
              href="/products?sort=newest"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/20">
        <div className="mx-auto max-w-[1600px] px-3 py-12 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t("featured")}</h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="relative">
                {product.rating > 4.9 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
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

      {/* CTA */}
      <section className="mx-auto max-w-[1600px] px-3 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-8 sm:p-12">
          <div className="relative z-10 text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-primary-foreground">
              开启你的紫砂之旅
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 max-w-lg mx-auto leading-relaxed">
              每一把壶都有它自己的故事。无论你是资深茶客还是刚刚入门，
              在这里都能找到属于你的那一把。
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-primary hover:bg-white/90 transition-colors shadow-lg active:scale-95"
              >
                注册会员
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-white/10 transition-colors active:scale-95"
              >
                浏览商品
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
