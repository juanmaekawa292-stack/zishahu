"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { ArrowRight, Shield, Truck, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const t = useTranslations("common");
  const featuredProducts = products.filter((p) => p.featured);
  const newProducts = products.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <div>
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Slide 1: Brand Hero */}
          <div className="relative min-w-full bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20 dark:to-background">
            <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="animate-slideUp space-y-6">
                  <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
                    宜兴原矿 · 匠心手作
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    一壶一世界
                    <br />
                    <span className="text-primary">紫砂雅集</span>
                  </h1>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                    精选宜兴正宗紫砂壶、茶具，每件作品都承载着千年陶都的匠心传承。
                    从矿料到成品，数十道工序，只为呈现一杯好茶。
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      {t("viewAll")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/products?category=teapot"
                      className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      浏览紫砂壶
                    </Link>
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/20 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-9xl">🫖</span>
                      <p className="mt-4 text-lg text-muted-foreground">匠心手作 · 全球送达</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/5 blur-xl" />
                  <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-secondary/5 blur-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: New Collection */}
          <div className="relative min-w-full bg-gradient-to-br from-secondary/10 via-background to-primary/5 dark:from-secondary/20 dark:via-background dark:to-primary/10">
            <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="animate-slideUp space-y-6 lg:order-2">
                  <div className="inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary font-medium">
                    2026 夏季 · 新品首发
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    夏日清风
                    <br />
                    <span className="text-secondary">薄胎紫砂</span>
                  </h1>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                    薄如蝉翼，轻若浮云。全新薄胎工艺系列，在炎炎夏日为您带来
                    更轻盈的握感、更透气的茶香体验。
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/products?sort=newest"
                      className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
                    >
                      探索新品
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      全部商品
                    </Link>
                  </div>
                </div>
                <div className="relative hidden lg:block lg:order-1">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-teal-100 dark:from-blue-900/30 dark:to-teal-800/20 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-9xl">🍃</span>
                      <p className="mt-4 text-lg text-muted-foreground">薄胎工艺 · 轻盈之选</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-secondary/5 blur-xl" />
                  <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Gift & Global */}
          <div className="relative min-w-full bg-gradient-to-br from-rose-50 via-background to-amber-50 dark:from-rose-950/20 dark:via-background dark:to-amber-950/20">
            <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="animate-slideUp space-y-6">
                  <div className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-500 font-medium">
                    茶礼甄选 · 全球送达
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    以茶会友
                    <br />
                    <span className="text-rose-500">心意之选</span>
                  </h1>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                    精选宜兴紫砂礼盒，从矿料到成品全程可追溯。国际直邮，
                    让每一份东方心意都能准时抵达世界的每一个角落。
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/products?category=gift"
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-500/90 transition-colors shadow-lg shadow-rose-500/20"
                    >
                      选购茶礼
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/service/shipping"
                      className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      配送说明
                    </Link>
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/30 dark:to-amber-800/20 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-9xl">🎁</span>
                      <p className="mt-4 text-lg text-muted-foreground">精美礼盒 · 国际直邮</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-rose-500/5 blur-xl" />
                  <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-amber-500/5 blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? "w-8 bg-primary"
                  : "w-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-background transition-colors"
          aria-label="Previous slide"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-background transition-colors"
          aria-label="Next slide"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </section>

{/* Features */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Truck, title: "全球配送", desc: "支持国际物流，安全送达" },
            { icon: Shield, title: "品质保证", desc: "原矿宜兴紫砂，真伪可鉴" },
            { icon: RefreshCw, title: "无忧退换", desc: "30天无理由退换服务" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("featured")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">精心挑选的紫砂臻品</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {t("viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
      </section>

      {/* New Arrivals */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("newArrivals")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">最新上架的紫砂作品</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
              开启你的紫砂之旅
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 max-w-lg mx-auto">
              每一把壶都有自己的性格，找到与你相契的那一把。
              注册成为会员，享受专属优惠和最新作品通知。
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

