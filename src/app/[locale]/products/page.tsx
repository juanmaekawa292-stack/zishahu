"use client";

import { Suspense, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, Grid3X3, LayoutList, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { categories, shapes } from "@/data/products";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { key: "default", labelKey: "default" },
  { key: "price-asc", labelKey: "priceAsc" },
  { key: "price-desc", labelKey: "priceDesc" },
  { key: "newest", labelKey: "newest" },
  { key: "rating", labelKey: "rating" },
] as const;

const ITEMS_PER_PAGE = 20;
const MOBILE_ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1600px] px-4 py-12 text-center text-muted-foreground">加载中...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const t = useTranslations("common");
  const tProduct = useTranslations("product");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch((e) => console.error("Failed to fetch products:", e));
  }, []);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileLoadedItems, setMobileLoadedItems] = useState(MOBILE_ITEMS_PER_PAGE);
  const [isMobile, setIsMobile] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "default";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentShape = searchParams.get("shape") || "all";

  const products = allProducts;
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (currentCategory !== "all") {
      result = result.filter((p) => p.category === currentCategory);
    }
    if (currentShape !== "all") {
      result = result.filter((p) => (p.specs?.shapeType || "") === currentShape);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title_zhCN.toLowerCase().includes(q) ||
          p.title_zhTW.toLowerCase().includes(q) ||
          p.description_zhCN.toLowerCase().includes(q) ||
          p.description_zhTW.toLowerCase().includes(q)
      );
    }
    switch (currentSort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [currentCategory, currentSort, searchQuery, currentShape]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Mobile: infinite scroll - show increasing number of items
  const mobileVisibleProducts = useMemo(() => {
    return filteredProducts.slice(0, mobileLoadedItems);
  }, [filteredProducts, mobileLoadedItems]);

  const hasMoreMobile = mobileLoadedItems < filteredProducts.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMobile) {
          setMobileLoadedItems((prev) => Math.min(prev + MOBILE_ITEMS_PER_PAGE, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isMobile, hasMoreMobile, filteredProducts.length]);

  // Reset mobile loaded items when filters change
  useEffect(() => {
    setMobileLoadedItems(MOBILE_ITEMS_PER_PAGE);
  }, [currentCategory, currentSort, currentShape, searchQuery]);

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "default" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== "page") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParam("search", searchQuery);
  };

  const displayedProducts = isMobile ? mobileVisibleProducts : paginatedProducts;

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-6 sm:px-6 lg:px-8">
      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-xl animate-slideUp overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-medium text-foreground">筛选</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-5">
              {/* Categories */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">分类</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => { updateSearchParam("category", cat.key); setMobileFilterOpen(false); }}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        currentCategory === cat.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                      )}
                    >
                      {cat.label_zhCN}
                    </button>
                  ))}
                </div>
              </div>
              {/* Shapes */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">壶型</h4>
                <div className="flex flex-wrap gap-2">
                  {shapes.slice(0, 15).map((shape) => (
                    <button
                      key={shape.key}
                      onClick={() => { updateSearchParam("shape", shape.key); setMobileFilterOpen(false); }}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs transition-colors border",
                        currentShape === shape.key
                          ? "bg-amber-600 text-white border-amber-600"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {shape.label_zhCN}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sort */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">排序</h4>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { updateSearchParam("sort", opt.key); setMobileFilterOpen(false); }}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        currentSort === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                      )}
                    >
                      {t(opt.labelKey as any)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-muted-foreground">
        <a href="/" className="hover:text-primary transition-colors">{t("home")}</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t("products")}</span>
      </nav>

      {/* Title + Stats */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t("products")}</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          {filteredProducts.length} 件商品
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search")}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </form>
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="sm:hidden flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground"
          >
            <Filter className="h-4 w-4" />
            <span>筛选</span>
          </button>
        </div>

        {/* Sort + View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">排序:</span>
            <select
              value={currentSort}
              onChange={(e) => updateSearchParam("sort", e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{t(opt.labelKey as any)}</option>
              ))}
            </select>
          </div>
          {/* View toggle (desktop) */}
          <div className="hidden sm:flex items-center border border-input rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Shape filter chips (desktop) */}
        <div className="hidden sm:flex flex-wrap gap-2 pb-2 border-b border-border/30">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => updateSearchParam("category", cat.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors border",
                currentCategory === cat.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
            >
              {cat.label_zhCN}
            </button>
          ))}
        </div>

        {/* Shape chips */}
        <div className="flex flex-wrap gap-1.5">
          {shapes.slice(0, 15).map((shape) => (
            <button
              key={shape.key}
              onClick={() => updateSearchParam("shape", shape.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                currentShape === shape.key
                  ? "bg-amber-600 text-white border-amber-600"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
            >
              {shape.label_zhCN}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div
            className={cn(
              viewMode === "grid" || isMobile
                ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
                : "space-y-4"
            )}
          >
            {displayedProducts.filter(Boolean).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Mobile: Load More Sentinel */}
          {isMobile && hasMoreMobile && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                加载更多...
              </div>
            </div>
          )}

          {/* Desktop: Pagination */}
          {!isMobile && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => updateSearchParam("page", String(currentPage - 1))}>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">上一页</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => (
                  <span key={page} className="contents">
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-muted-foreground">...</span>}
                    <button
                      onClick={() => updateSearchParam("page", String(page))}
                      className={cn("h-8 w-8 rounded-md text-xs font-medium transition-colors", currentPage === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
                    >
                      {page}
                    </button>
                  </span>
                ))}
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => updateSearchParam("page", String(currentPage + 1))}>
                <span className="mr-1 hidden sm:inline">下一页</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Mobile: Load count */}
          {isMobile && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              已显示 {mobileVisibleProducts.length} / {filteredProducts.length} 件商品
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <div className="text-6xl mb-4">🍵</div>
          <h3 className="text-lg font-medium text-foreground">{t("noResults")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("continueShopping")}</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); router.push(pathname); }}>
            {t("backToHome")}
          </Button>
        </div>
      )}
    </div>
  );
}
