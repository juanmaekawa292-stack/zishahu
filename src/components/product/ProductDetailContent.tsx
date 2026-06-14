"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, Share2, Check } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface ProductDetailContentProps {
  product: Product;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const t = useTranslations("common");
  const tProduct = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const hasVideo = product.videos && product.videos.length > 0;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const currentImages = selectedVariant?.image
    ? [selectedVariant.image]
    : product.images;

  const hasVariants = product.variants && product.variants.length > 0;

  const displayCarousel = [
    ...(hasVideo ? product.videos.map((v) => ({ type: "video" as const, src: v })) : []),
    ...currentImages.map((img) => ({ type: "image" as const, src: img })),
  ];

  useEffect(() => { setSelectedImage(0); }, [selectedVariant]);

  const handleAddToCart = () => {
    let cartProduct: Product;
    if (selectedVariant) {
      cartProduct = {
        ...product,
        id: product.id + "-" + selectedVariant.id,
        price: selectedVariant.price,
        images: selectedVariant.image ? [selectedVariant.image, ...product.images] : product.images,
        title_zhCN: product.title_zhCN + " (" + selectedVariant.name_zhCN + ")",
        title_zhTW: product.title_zhTW + " (" + selectedVariant.name_zhTW + ")",
      };
    } else {
      cartProduct = product;
    }
    addItem(cartProduct, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const goToSlide = useCallback((index: number) => {
    if (index < 0) index = displayCarousel.length - 1;
    if (index >= displayCarousel.length) index = 0;
    setSelectedImage(index);
    if (thumbnailRef.current) {
      const thumb = thumbnailRef.current.children[index] as HTMLElement;
      if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [displayCarousel.length]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(selectedImage + 1);
      else goToSlide(selectedImage - 1);
    }
  };

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round((1 - currentPrice / currentOriginalPrice) * 100) : 0;

  const variantGroups = hasVariants
    ? product.variants!.reduce((groups: Record<string, ProductVariant[]>, v) => {
        const baseName = v.name_zhCN.replace(/单壶|大套装|套装|一壶四杯|一壶六杯/g, "").trim() || v.name_zhCN;
        if (!groups[baseName]) groups[baseName] = [];
        groups[baseName].push(v);
        return groups;
      }, {})
    : {};

  const categoryLabel = product.category === "teapot" ? "紫砂壶" :
    product.category === "cup" ? "茶杯" :
    product.category === "teaPet" ? "茶宠" :
    product.category === "teaTool" ? "茶具配件" : "礼品套装";

  return (
    <div className="animate-fadeIn">
      <nav className="mb-6 text-xs text-muted-foreground">
        <a href="/" className="hover:text-primary transition-colors">{t("home")}</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary transition-colors">{t("products")}</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title_zhCN}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Left: Image Gallery */}
        <div className="space-y-3">
          <div
            className="relative aspect-square overflow-hidden rounded-xl bg-white dark:bg-neutral-900"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${selectedImage * 100}%)` }}>
              {displayCarousel.map((item, idx) => (
                <div key={idx} className="relative h-full w-full flex-shrink-0 flex items-center justify-center bg-white dark:bg-neutral-900">
                  {item.type === "video" ? (
                    <video
                      ref={idx === selectedImage ? videoRef : null}
                      src={item.src}
                      className="h-full w-full object-contain"
                      autoPlay={idx === selectedImage}
                      muted loop playsInline controls
                      poster={product.images[0] || undefined}
                    />
                  ) : (
                    <Image src={item.src} alt={`${product.title_zhCN} - ${idx + 1}`} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" priority={idx === 0} />
                  )}
                </div>
              ))}
            </div>

            {discountPercent > 0 && (
              <Badge variant="destructive" className="absolute left-3 top-3 z-10 text-xs">-{discountPercent}%</Badge>
            )}

            {displayCarousel.length > 1 && (
              <>
                <button onClick={() => goToSlide(selectedImage - 1)}
                  className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-2 text-foreground shadow-md hover:bg-white transition-all", isHovering ? "opacity-100" : "opacity-0")}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => goToSlide(selectedImage + 1)}
                  className={cn("absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-2 text-foreground shadow-md hover:bg-white transition-all", isHovering ? "opacity-100" : "opacity-0")}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {displayCarousel.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {displayCarousel.map((_, idx) => (
                  <button key={idx} onClick={() => goToSlide(idx)}
                    className={cn("h-2 rounded-full transition-all", idx === selectedImage ? "w-6 bg-primary" : "w-2 bg-neutral-400/60 hover:bg-neutral-400/80")} />
                ))}
              </div>
            )}
          </div>

          {displayCarousel.length > 1 && (
            <div ref={thumbnailRef} className="flex gap-2 overflow-x-auto pb-1">
              {displayCarousel.map((item, idx) => (
                <button key={idx} onClick={() => goToSlide(idx)}
                  className={cn("relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all", selectedImage === idx ? "border-primary shadow-sm" : "border-border hover:border-muted-foreground/40")}>
                  {item.type === "video" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40">
                        <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  ) : (
                    <Image src={item.src} alt="" fill className="object-cover" sizes="64px" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{categoryLabel}</Badge>
            {product.featured && <Badge variant="warning" className="text-[10px]">精选</Badge>}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{product.title_zhCN}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{product.rating}</span>
              </div>
              {product.reviewCount > 0 && <span className="text-muted-foreground">({product.reviewCount} 条评价)</span>}
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(currentOriginalPrice)}</span>
            )}
            {selectedVariant && <span className="text-xs text-muted-foreground ml-2">(选: {selectedVariant.name_zhCN})</span>}
          </div>

          {hasVariants && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">规格选择</h3>
              <div className="space-y-2">
                {Object.entries(variantGroups).map(([groupName, variants]) => (
                  <div key={groupName} className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">{groupName}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        const isOutOfStock = v.stock <= 0;
                        return (
                          <button key={v.id}
                            onClick={() => { if (!isOutOfStock) setSelectedVariant(isSelected ? null : v); }}
                            disabled={isOutOfStock}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-md border px-3 py-3 text-xs transition-all",
                              isSelected ? "border-primary bg-primary/5 text-primary font-medium" :
                              isOutOfStock ? "border-border/50 text-muted-foreground/40 cursor-not-allowed line-through" :
                              "border-border hover:border-primary/50 text-foreground"
                            )}>
                            {v.image && (
                              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
                                <Image src={v.image} alt={v.name_zhCN} width={56} height={56} className="object-cover rounded-md" />
                              </div>
                            )}
                            <span>{v.name_zhCN}</span>
                            <span className={cn("ml-0.5", isSelected ? "text-primary" : "text-muted-foreground")}>{formatPrice(v.price)}</span>
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  {product.inStock ? `有货 (${selectedVariant ? selectedVariant.stock : product.stock})` : "暂时缺货"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{t("quantity")}</span>
              <div className="flex items-center border border-input rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(selectedVariant ? selectedVariant.stock : product.stock, quantity + 1))} disabled={quantity >= (selectedVariant ? selectedVariant.stock : product.stock)} className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">最大 {selectedVariant ? selectedVariant.stock : product.stock} 件</span>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1" disabled={!product.inStock || addedToCart} onClick={handleAddToCart}>
                {addedToCart ? <><Check className="h-4 w-4 mr-2" /> 已添加</> : <><ShoppingCart className="h-4 w-4 mr-2" /> {t("addToCart")}</>}
              </Button>
              <Button variant="outline" size="lg" className="px-3"><Heart className="h-5 w-5" /></Button>
              <Button variant="outline" size="lg" className="px-3"><Share2 className="h-5 w-5" /></Button>
            </div>
          </div>

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

      {/* Detail Images Section */}
      {product.detailImages && product.detailImages.length > 0 && (
        <section>
          <h2 className="mb-6 text-lg font-bold text-foreground text-center">商品详情</h2>
          <div className="mx-auto max-w-3xl">
            {product.detailImages.map((img, idx) => (
              <div key={idx} className="relative w-full bg-white dark:bg-neutral-900">
                <Image src={img} alt={`${product.title_zhCN} 详情图 ${idx + 1}`} width={1200} height={2064} className="h-auto w-full" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
