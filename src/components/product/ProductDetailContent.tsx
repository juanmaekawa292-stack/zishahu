"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, Share2, Check, X, ZoomIn, Pencil, Expand } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCurrency } from "@/hooks/useCurrency";
import { getCurrentUser } from "@/services/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Link } from "@/i18n";
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
 import { getProductTitle, getVariantName, getCategoryLabel, getSpecLabel } from "@/lib/product-locale";

interface ProductDetailContentProps {
  product: Product;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const t = useTranslations("common");
  const tProduct = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);
  const locale = useLocale();
  const productTitle = getProductTitle(product, locale);
  const { format: _format } = useCurrency();

  const [isClient, setIsClient] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSkuPreview, setShowSkuPreview] = useState(false);
  const [previewVariant, setPreviewVariant] = useState<ProductVariant | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => { setIsClient(true); }, []);

  const hasVideo = product.videos && product.videos.length > 0;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const currentImages = selectedVariant?.image
    ? [selectedVariant.image]
    : product.images;

  
  // ��������Ⱦ
  const hasVariants = product.variants && product.variants.length > 0;

  const displayCarousel = useMemo(() => [
    ...(hasVideo ? (product.videos || []).map((v: string) => ({ type: "video" as const, src: v })) : []),
    ...currentImages.map((img: string) => ({ type: "image" as const, src: img })),
  ], [hasVideo, currentImages, product.videos]);

  useEffect(() => { setSelectedImage(0); }, [selectedVariant]);

  const handleAddToCart = () => {
    const user = getCurrentUser();
    if (!user && isClient) {
      setShowLoginPrompt(true);
      return;
    }
    let cartProduct: Product;
    if (selectedVariant) {
      cartProduct = {
        ...product,
        id: product.id + "-" + selectedVariant.id,
        price: selectedVariant.price,
        images: selectedVariant.image ? [selectedVariant.image, ...product.images] : product.images,
        title_zhCN: product.title_zhCN + " (" + getVariantName(selectedVariant, locale) + ")",
        title_en: product.title_en ? product.title_en + " (" + getVariantName(selectedVariant, locale) + ")" : undefined,
        title_zhTW: product.title_zhTW + " (" + getVariantName(selectedVariant, locale) + ")",
      };
    } else {
      cartProduct = product;
    }
    addItem(cartProduct, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSkuClick = (v: ProductVariant) => {
    if (v.stock <= 0) return;
    if (selectedVariant?.id === v.id) {
      setSelectedVariant(null);
      return;
    }
    setSelectedVariant(v);
  };

  const handleSkuPreview = (v: ProductVariant) => {
    setPreviewVariant(v);
    setShowSkuPreview(true);
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

  const categoryLabel = getCategoryLabel(product.category, locale);

  // Compute ordered specs outside JSX for JSX parser compatibility
 var SPEC_ORDER_LIST = ["firingType","capacity","mainImageSource","origin","handmade","material","shapeType","packaging","kiln","year","color","clay","craft"];
 var orderedSpecsResult = [];
 var specsSource = locale === "en" && product.specs_en ? product.specs_en : product.specs;
 for (var si = 0; si < SPEC_ORDER_LIST.length; si++) {
   var sk = SPEC_ORDER_LIST[si];
   if (specsSource[sk] as any && (specsSource[sk] as string).length > 0) {
     orderedSpecsResult.push([sk, specsSource[sk] as string]);
   }

 }

  return (
    <div className="animate-fadeIn">
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors">
            <X className="h-8 w-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => p <= 0 ? displayCarousel.length - 1 : p - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => p >= displayCarousel.length - 1 ? 0 : p + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors">
            <ChevronRight className="h-10 w-10" />
          </button>
          <div className="w-full h-full flex items-center justify-center p-12" onClick={(e) => e.stopPropagation()}>
            {displayCarousel[lightboxIndex]?.type === "video" ? (
              <video src={displayCarousel[lightboxIndex].src} controls autoPlay className="max-h-full max-w-full" />
            ) : (
              <img src={displayCarousel[lightboxIndex].src} alt="" className="max-h-full max-w-full object-contain" />
            )}
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {displayCarousel.map((_, i) => (
              <div key={i} className={"w-1.5 h-1.5 rounded-full " + (i === lightboxIndex ? "bg-white scale-125" : "bg-white/30")} />
            ))}
          </div>
        </div>
      )}
      <nav className="mb-6 text-xs text-muted-foreground">
        <a href="/" className="hover:text-primary transition-colors">{t("home")}</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary transition-colors">{t("products")}</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{productTitle}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Left: Image Gallery */}
        <div className="space-y-3">
          <div
            className="relative aspect-square overflow-hidden rounded-xl bg-white dark:bg-neutral-900 cursor-pointer" onClick={() => { setLightboxIndex(selectedImage); setLightboxOpen(true); }}
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
                    <Image src={item.src} alt={`${productTitle} - ${idx + 1}`} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" priority={idx === 0} />
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
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {displayCarousel.map((_, idx) => (
                  <button key={idx} onClick={() => goToSlide(idx)}
                    className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", idx === selectedImage ? "bg-white/90 scale-125" : "bg-white/40 hover:bg-white/60")} />
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
                    <Image src={item.src} alt="" fill className="object-contain" sizes="64px" />
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
            {product.featured && <Badge variant="warning" className="text-[10px]">locale === "en" ? "Featured" : (locale === "zh-TW" ? "���x" : "��ѡ")</Badge>}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{productTitle}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{product.rating}</span>
              </div>
              {product.reviewCount > 0 && <span className="text-muted-foreground">({product.reviewCount} ������)</span>}
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{_format(currentPrice)}</span>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-lg text-muted-foreground line-through">{_format(currentOriginalPrice)}</span>
            )}
            {selectedVariant && <span className="text-xs text-muted-foreground ml-2">(ѡ: {getVariantName(selectedVariant, locale)})</span>}
          </div>

      {hasVariants && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">���ѡ��</h3>
                {selectedVariant && (
                  <button onClick={() => setSelectedVariant(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">���</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(product.variants || []).map((v: ProductVariant) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOutOfStock = v.stock <= 0;
                  return (
                    <div key={v.id} className="relative" onContextMenu={(e: React.MouseEvent) => { e.preventDefault(); handleSkuPreview(v); }}>
                      <button
                        onClick={() => handleSkuClick(v)}
                        disabled={isOutOfStock}
                        className={cn(
                          "relative flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-all",
                          isSelected ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary/30" :
                          isOutOfStock ? "border-border/40 text-muted-foreground/30 cursor-not-allowed line-through" :
                          "border-border hover:border-primary/40 text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span>{getVariantName(v, locale)}</span>
                        <span className={cn("font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>{_format(v.price)}</span>
                        {isSelected && <Check className="h-3 w-3 shrink-0" />}
                        {v.image && (
                          <button
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSkuPreview(v); }}
                            className="ml-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                          >
                            <ZoomIn className="h-3 w-3" />
                          </button>
                        )}
                      </button>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedVariant?.image && (
                <div className="mt-2 flex items-center gap-3 rounded-md bg-muted/30 p-2">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white">
                    <Image src={selectedVariant.image} alt={getVariantName(selectedVariant, locale)} width={48} height={48} className="object-contain w-full h-full" />
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-foreground">{getVariantName(selectedVariant, locale)}</p>
                    <p className="text-primary font-medium">{_format(selectedVariant.price)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                      {(product as any).sourceSku && (
            <p className="text-sm text-muted-foreground mb-3">
              <span className="text-muted-foreground">����: </span>
              <span className="font-medium text-foreground">{(product as any).sourceSku}</span>
            </p>
          )}
              
              <h3 className="text-sm font-medium text-foreground">{tProduct("specifications")}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {orderedSpecsResult.map(function(item, idx) {
                  return <div key={idx} className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">{getSpecLabel(item[0], locale) || tProduct("spec_" + item[0]) || item[0]}</span>
                    <span className="font-medium text-foreground">{item[1]}</span>
                  </div>;
                })}
                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">���</span>
                  <span className={cn("font-medium", product.inStock ? "text-emerald-600" : "text-red-500")}>
                    {product.inStock ? `�л� (${selectedVariant ? selectedVariant.stock : product.stock})` : "��ʱȱ��"}
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
              <span className="text-xs text-muted-foreground">��� {selectedVariant ? selectedVariant.stock : product.stock} ��</span>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1" disabled={!product.inStock || addedToCart} onClick={handleAddToCart}>
                {addedToCart ? <><Check className="h-4 w-4 mr-2" /> ������</> : <><ShoppingCart className="h-4 w-4 mr-2" /> {t("addToCart")}</>}
              </Button>
              <Button variant="outline" size="lg" className="px-3"><Heart className="h-5 w-5" /></Button>
            {isClient && getCurrentUser()?.role === "admin" && (
              <Button size="lg" variant="outline" className="flex-1" onClick={function() { window.localStorage.setItem("zisha-edit-product-id", product.id); window.open("/admin/products", "_blank"); }}>
                <Pencil className="h-4 w-4 mr-2" />
                �༭��Ʒ
              </Button>
            )}
              <Button variant="outline" size="lg" className="px-3"><Share2 className="h-5 w-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
            {[
              { icon: Truck, text: "ȫ������" },
              { icon: Shield, text: "Ʒ�ʱ�֤" },
              { icon: RefreshCw, text: "30���˻�" },
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
        <div className="mt-8">
          <h2 className="mb-6 text-lg font-bold text-foreground text-center">��Ʒ����</h2>
          <div className="mx-auto max-w-3xl" style={{ lineHeight: 0 }}>
            {product.detailImages.map((img: string, idx: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={img}
                alt={`${productTitle} ����ͼ ${idx + 1}`}
                style={{ display: 'block', width: '100%', height: 'auto' }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* SKU Preview Dialog */}
      <Dialog open={showSkuPreview} onOpenChange={setShowSkuPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{locale == "en" ? "SKU Preview" : "SKU 预览"}</DialogTitle>
          </DialogHeader>
          {previewVariant && (
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
                {previewVariant.image ? (
                  <Image src={previewVariant.image} alt={getVariantName(previewVariant, locale)} fill className="object-contain" sizes="(max-width: 640px) 100vw, 400px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted text-4xl">{String.fromCodePoint(0x1FAE6)}</div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{getVariantName(previewVariant, locale)}</h4>
                <p className="text-lg font-bold text-primary">{_format(previewVariant.price)}</p>
                {previewVariant.stock > 0 ? (
                  <p className="text-xs text-emerald-600">�л� ({previewVariant.stock} ��)</p>
                ) : (
                  <p className="text-xs text-red-500">��ʱȱ��</p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedVariant(previewVariant);
                  setShowSkuPreview(false);
                }}
                disabled={previewVariant.stock <= 0}
              >
                ѡ��˹��
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>��¼ / ע��</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">���ȵ�¼��ע���˻������ɼ��빺�ﳵ</p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1" onClick={() => setShowLoginPrompt(false)}>
                <Button variant="outline" className="w-full">��¼</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setShowLoginPrompt(false)}>
                <Button className="w-full">ע��</Button>
              </Link>
            </div>
            <button onClick={() => setShowLoginPrompt(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              �������
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

