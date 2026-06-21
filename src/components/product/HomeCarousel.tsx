'use client'

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const SLIDE_COUNT = 3;

export function HomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = useTranslations("common");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDE_COUNT - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = useCallback((idx: number) => setCurrentSlide(idx), []);
  const goPrev = useCallback(
    () => setCurrentSlide((prev) => (prev === 0 ? SLIDE_COUNT - 1 : prev - 1)),
    []
  );
  const goNext = useCallback(
    () => setCurrentSlide((prev) => (prev === SLIDE_COUNT - 1 ? 0 : prev + 1)),
    []
  );

  return (
    <section className="relative overflow-hidden">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* Slide 1: Brand Hero — zisha theme */}
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
                    <span className="text-9xl">🏺</span>
                    <p className="mt-4 text-lg text-muted-foreground">匠心手作 · 全球送达</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/5 blur-xl" />
                <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-secondary/5 blur-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: New Collection — summer thin-clay */}
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
                    <span className="text-9xl">🍈</span>
                    <p className="mt-4 text-lg text-muted-foreground">薄胎工艺 · 轻盈之选</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-secondary/5 blur-xl" />
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Slide 3: Quality Promise — global shipping, authentic, returns */}
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
                    <span className="text-9xl">🎵</span>
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

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {Array.from({ length: SLIDE_COUNT }, (_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              currentSlide === idx
                ? "w-8 bg-primary"
                : "w-2 bg-foreground/20 hover:bg-foreground/40"
            )}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-background transition-colors"
        aria-label="Previous slide"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-background transition-colors"
        aria-label="Next slide"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}

