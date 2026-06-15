"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";

export default function CartPage() {
  const t = useTranslations("common");
  const tCart = useTranslations("cart");
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tCart("empty")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{tCart("emptyHint")}</p>
          <Link href="/products">
            <Button className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("continueShopping")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{tCart("title")}</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          {tCart("clearCart")}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-lg border border-border bg-card p-4 animate-fadeIn">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted relative">
                {item.product.images && item.product.images[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.title_zhCN} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20">
                    <span className="text-2xl">🎁</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                    {item.product.title_zhCN}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{"$" + Number(item.product.price).toFixed(2)} / 件</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-input rounded-md">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">{"$" + Number(item.product.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.productId)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-medium text-foreground">{t("total")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">{"$" + Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className={cn("font-medium", shipping === 0 ? "text-emerald-600" : "")}>
                  {shipping === 0 ? "免费" : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && subtotal < 200 && (
                <p className="text-[10px] text-muted-foreground">再购 {"$" + Number(200 - subtotal).toFixed(2)} 即可免运费</p>
              )}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-base">
                  <span className="font-medium text-foreground">{t("total")}</span>
                  <span className="font-bold text-primary">{"$" + Number(total).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Link href="/checkout"><Button className="w-full" size="lg">{t("checkout")}</Button></Link>
            <Link href="/products" className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors">{t("continueShopping")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
