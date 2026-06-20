"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Star } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { Link } from "@/i18n";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/services/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  var _c = useCurrency();
  var _format = _c.format;
  const t = useTranslations("common");
  const addItem = useCartStore((s) => s.addItem);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isClient && !getCurrentUser()) {
      setShowLoginPrompt(true);
      return;
    }
    addItem(product);
  };

  return (
    <div className="group animate-fadeIn">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-muted" style={{minHeight: '280px'}}>
          {product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.title_zhCN}
              fill
              className="object-contain bg-muted/20"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{objectFit: 'contain'}}
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20">
              <div className="text-center">
                <span className="text-5xl">
                  {product.category === "teapot" ? "🫖" : product.category === "cup" ? "🍵" : product.category === "teaPet" ? "🐉" : product.category === "teaTool" ? "🛠️" : "🫖"}
                </span>
                <p className="mt-2 text-[10px] text-muted-foreground">{product.title_zhCN}</p>
              </div>
            </div>
          )}

          {product.shape && (
            <Badge variant="secondary" className="absolute right-2 top-2">
              {product.shape}
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-medium">{t("outOfStock")}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-1.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.title_zhCN}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary">{_format(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{_format(product.originalPrice)}</span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isClient && !getCurrentUser()) {
                setShowLoginPrompt(true);
                return;
              }
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? t("addToCart") : t("outOfStock")}
        </Button>
      </div>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">请先登录</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl block">🫖</span>
            <p className="text-sm text-muted-foreground">登录后即可添加商品到购物车、收藏商品</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = "/login"}>
                去登录
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/register"}>
                注册账户
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
