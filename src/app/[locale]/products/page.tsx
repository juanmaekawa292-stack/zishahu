"use client";

import { Suspense, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, Grid3X3, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { products, categories, shapes } from "@/data/products";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { key: "default", labelKey: "default" },
  { key: "price-asc", labelKey: "priceAsc" },
  { key: "price-desc", labelKey: "priceDesc" },
  { key: "newest", labelKey: "newest" },
  { key: "rating", labelKey: "rating" },
] as const;

const ITEMS_PER_PAGE = 9;

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground">加载中...</div>}>
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

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "default";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentShape = searchParams.get("shape") || "all";

    // Direct reference to prevent tree-shaking
  const _productCount = products.length;

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
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
 }, [currentCategory, currentSort, searchQuery, currentShape]);


  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <span>{t("home")}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t("products")}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("products")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filteredProducts.length} {t("products")}
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search")}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => updateSearchParam("sort", e.target.value)}
                className="appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="default">{t("viewAll")}</option>
                <option value="price-asc">{t("price")} ↑</option>
                <option value="price-desc">{t("price")} ↓</option>
                <option value="newest">{t("newArrivals")}</option>
                <option value="rating">{tProduct("reviews")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {t("categories")}
            </Button>

            <div className="hidden sm:flex border border-input rounded-md">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-l-md transition-colors",
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-r-md transition-colors",
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pb-3 border-b border-border/50">
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

        <div className="flex flex-wrap gap-2">
          {shapes.slice(1).map((shape) => (
            <button
              key={shape.key}
              onClick={() => updateSearchParam("shape", shape.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors border",
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

      {paginatedProducts.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          )}
        >
          {paginatedProducts.filter(Boolean).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="text-6xl mb-4">🍵</div>
          <h3 className="text-lg font-medium text-foreground">{t("noResults")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("continueShopping")}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              router.push(pathname);
            }}
          >
            {t("backToHome")}
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateSearchParam("page", String(currentPage - 1))}
          >
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
                {idx > 0 && arr[idx - 1] !== page - 1 && (
                  <span className="px-1 text-muted-foreground">...</span>
                )}
                <button
                  onClick={() => updateSearchParam("page", String(page))}
                  className={cn(
                    "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {page}
                </button>
              </span>
            ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateSearchParam("page", String(currentPage + 1))}
          >
            <span className="mr-1 hidden sm:inline">下一页</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
