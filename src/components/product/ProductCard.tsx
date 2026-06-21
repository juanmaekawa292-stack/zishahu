"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { Link } from "@/i18n";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  var _c = useCurrency();
  var _format = _c.format;
  const t = useTranslations("common");
  const addItem = useCartStore((s) => s.addItem);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shapeType = product.specs?.shapeType;

  const lowestVariantPrice = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return Math.min(...product.variants.map((v) => v.price));
  }, [product.variants]);

  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = hasVariants ? lowestVariantPrice! : product.price;
  const hasDiscount = product.originalPrice && product.originalPrice > displayPrice;
  const discountPercent = hasDiscount ? Math.round((1 - displayPrice / product.originalPrice!) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const slug = product.slug;

  return (
    <div className="group">
      <Link href={"/products/" + slug} className="block">
        <div className="relative overflow-hidden rounded-xl bg-muted aspect-square transition-all duration-300 group-hover:shadow-lg border border-border/20">
          {product.images.length > 0 ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.title_zhCN}
                fill
                className="object-cover bg-muted/20 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
              />
              {product.images.length > 1 && (
                <Image
                  src={product.images[1]}
                  alt=""
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0 hidden sm:block"
                  sizes="(max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20">
              <span className="text-4xl">{"🫖"}</span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && discountPercent > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {"-" + discountPercent + "%"}
              </span>
            )}
          </div>

          {shapeType && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center rounded-full bg-background/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm border border-border/30">
                {shapeType}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
              className="w-full rounded-lg bg-primary/90 backdrop-blur-sm py-2 text-xs font-medium text-primary-foreground hover:bg-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {t("addToCart")}
            </button>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-white text-sm font-medium tracking-wide">{t("outOfStock")}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2.5 space-y-1.5 px-0.5">
        <Link href={"/products/" + slug}>
          <h3 className="text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.title_zhCN}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className={cn("h-3 w-3", star <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-border")} />
            ))}
          </div>
          <span className="text-[11px]">{"(" + product.reviewCount + ")"}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasVariants ? (
            <span className="text-base font-bold text-primary">{_format(lowestVariantPrice!)}</span>
          ) : (
            <>
              <span className="text-base font-bold text-primary">{_format(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">{_format(product.originalPrice)}</span>
              )}
            </>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
          className="w-full sm:hidden rounded-lg bg-primary py-2.5 text-xs font-medium text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 mt-1.5"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t("addToCart")}
        </button>
      </div>
    </div>
  );
}
