"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface ProductDetailContentProps {
  product: Product;
}

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  teapot: "🫖",
  cup: "🥃",
  teaPet: "🐸",
  teaTool: "🥢",
  gift: "🎁",
};

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const t = useTranslations("common");
  const tProduct = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const placeholderImages = product.images.length > 0
    ? product.images
    : ["/placeholder"];

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-muted-foreground">
        <a href="/" className="hover:text-primary transition-colors">{t("home")}</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary transition-colors">{t("products")}</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title_zhCN}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20">
              <div className="text-center">
                <span className="text-8xl">{CATEGORY_EMOJI_MAP[product.category] || "🫖"}</span>
                <p className="mt-2 text-sm text-muted-foreground">{product.title_zhCN}</p>
              </div>
            </div>
            {product.originalPrice && (
              <Badge variant="destructive" className="absolute left-3 top-3">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </Badge>
            )}
            {/* Image navigation */}
            {placeholderImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + placeholderImages.length) % placeholderImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % placeholderImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {placeholderImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {placeholderImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                    selectedImage === idx ? "border-primary" : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20 text-xs text-muted-foreground">
                    {CATEGORY_EMOJI_MAP[product.category] || "🫖"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {product.category === "teapot" ? "紫砂壶" :
                 product.category === "cup" ? "茶杯" :
                 product.category === "teaPet" ? "茶宠" :
                 product.category === "teaTool" ? "茶具配件" : "礼品套装"}
              </Badge>
              {product.featured && (
                <Badge variant="warning" className="text-[10px]">精选</Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.title_zhCN}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {product.description_zhCN}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">({product.reviewCount} 条评价)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Specs */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">{tProduct("specifications")}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {product.specs.capacity && (
                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">{tProduct("capacity")}</span>
                  <span className="font-medium text-foreground">{product.specs.capacity}</span>
                </div>
              )}
              {product.specs.clay && (
                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">{tProduct("clay")}</span>
                  <span className="font-medium text-foreground">{product.specs.clay}</span>
                </div>
              )}
              {product.specs.craft && (
                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">{tProduct("craft")}</span>
                  <span className="font-medium text-foreground">{product.specs.craft}</span>
                </div>
              )}
              {product.specs.dimensions && (
                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">{tProduct("dimensions")}</span>
                  <span className="font-medium text-foreground">{product.specs.dimensions}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">库存</span>
                <span className={cn("font-medium", product.inStock ? "text-emerald-600" : "text-red-500")}>
                  {product.inStock ? `有货 (${product.stock})` : "暂时缺货"}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity + Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{t("quantity")}</span>
              <div className="flex items-center border border-input rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">最多 {product.stock} 件</span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={!product.inStock || addedToCart}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>✓ {t("addToCart")}</>
                ) : (
                  <><ShoppingCart className="h-4 w-4 mr-2" /> {t("addToCart")}</>
                )}
              </Button>
              <Button variant="outline" size="lg" className="px-3">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-3">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
            {[
              { icon: Truck, text: "全球配送" },
              { icon: Shield, text: "品质保证" },
              { icon: RefreshCw, text: "30天退换" },
            ].map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-1.5 text-center">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
