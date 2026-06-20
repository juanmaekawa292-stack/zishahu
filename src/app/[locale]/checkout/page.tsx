"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CreditCard, ChevronRight, MapPin, ShoppingBag, MessageSquare } from "lucide-react";
import { Link } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { countries } from "@/data/products";

const SHIPPING_METHODS = [
  { id: "standard", label: "标准配送 (10-15天)", price: 15, days: "10-15" },
  { id: "express", label: "快速配送 (5-8天)", price: 35, days: "5-8" },
];

function ShippingSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function DollarSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function CheckoutPage() {
  const t = useTranslations("common");
  const tCheckout = useTranslations("checkout");
  const { format: _format } = useCurrency();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState("shipping");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("lianlian");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CHAT_TOOLS = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "wechat", label: "WeChat" },
  { id: "messenger", label: "Messenger" },
  { id: "signal", label: "Signal" },
  { id: "line", label: "Line" },
];

  const [contactMethod, setContactMethod] = useState("email");
  const [contactId, setContactId] = useState("");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  useEffect(() => {
    // Auto-detect country via IP geolocation
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code && data.country_code !== "undefined") {
          setAddress(prev => ({ ...prev, country: data.country_code }));
        }
      })
      .catch(() => {
        // Silently fail, keep default US
      });
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = SHIPPING_METHODS.find((s) => s.id === shippingMethod)?.price || 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">购物车是空的</h1>
          <p className="mt-2 text-sm text-muted-foreground">请先添加商品到购物车</p>
          <Link href="/cart">
            <Button className="mt-6">返回购物车</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactMethod,
          contactId,
          items,
          address,
          shippingMethod,
          paymentMethod,
          subtotal,
          shipping,
          tax,
          total,
        }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const order = await res.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("提交订单失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        <span className={cn("font-medium", step === "shipping" ? "text-primary" : "text-muted-foreground")}>
          收货地址
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={cn("font-medium", step === "payment" ? "text-primary" : "text-muted-foreground")}>
          支付确认
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-foreground">{tCheckout("shippingAddress")}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("name")}</label>
                <input
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("phone")}</label>
                <input
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("street")}</label>
                <input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("city")}</label>
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("state")}</label>
                <input
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("zip")}</label>
                <input
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{tCheckout("country")}</label>
                <select
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name_zhCN}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShippingSvg className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-foreground">{tCheckout("shippingMethod")}</h2>
            </div>
            <div className="space-y-3">
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border p-4 transition-colors",
                    shippingMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="accent-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">{method.label}</span>
                      <p className="text-xs text-muted-foreground">{method.days} 个工作日</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {method.price === 0 ? "免费" : _format(method.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

                    {/* Contact Method */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-foreground">联系方式</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">选择你方便的沟通方式，方便我们联系你</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-foreground">聊天工具</label>
                <select value={contactMethod} onChange={e => setContactMethod(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  {CHAT_TOOLS.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-foreground">账号 / ID</label>
                <input type="text" value={contactId} onChange={e => setContactId(e.target.value)}
                  placeholder="输入你的账号"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
          {/* Payment Method */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-foreground">{tCheckout("payment")}</h2>
            </div>
            <div className="space-y-3">
              {[
                { id: "lianlian", label: "连连支付", Icon: CreditCard },
              ].map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors",
                    paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-primary"
                  />
                  <method.Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-medium text-foreground">{tCheckout("orderSummary")}</h2>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[160px]">
                    {item.product.title_zhCN} x {item.quantity}
                  </span>
                  <span className="font-medium">{_format(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">{_format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="font-medium">{shipping === 0 ? "免费" : _format(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tax")}</span>
                <span className="font-medium">{_format(tax)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-base">
                  <span className="font-medium text-foreground">{t("total")}</span>
                  <span className="font-bold text-primary">{_format(total)}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || !address.name || !address.phone || !address.street || !address.city || !address.zip}
            >
              {isSubmitting ? "提交中..." : tCheckout("placeOrder")}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              {tCheckout("freeShippingNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
