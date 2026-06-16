"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";


interface Props {
  params: Promise<{ id: string }>;
}

interface OrderData {
  id: string;
  items: Array<{ productId: string; quantity: number; product: { title_zhCN: string; price: number } }>;
  address: { name: string; phone: string; street: string; city: string; state: string; zip: string; country: string };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  sourceMap?: Record<string, { sourceUrl: string; sourceSku?: string }>;
  trackingNumber?: string;
}

const STORE: Record<string, OrderData> = {
  "demo-order": {
    id: "demo-order",
    items: [{ productId: "zp-001", quantity: 1, product: { title_zhCN: "经典西施壶", price: 1280 } }],
    address: { name: "张三", phone: "+1 (555) 123-4567", street: "123 Main Street", city: "San Francisco", state: "CA", zip: "94102", country: "US" },
    shippingMethod: "standard",
    paymentMethod: "stripe",
    subtotal: 1280,
    shipping: 15,
    tax: 102.4,
    total: 1397.4,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "success" }> = {
  pending: { label: "待付款", variant: "warning" },
  paid: { label: "已付款", variant: "default" },
  shipped: { label: "已发货", variant: "default" },
  delivered: { label: "已送达", variant: "success" },
  cancelled: { label: "已取消", variant: "secondary" },
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const { format: _format } = useCurrency();
  const order = STORE[id];
  if (!order) notFound();
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">订单提交成功！</h1>
        <p className="mt-2 text-sm text-muted-foreground">感谢您的购买，我们会尽快为您安排发货。</p>
        <p className="mt-1 text-xs text-muted-foreground">订单编号: <span className="font-mono text-primary">{id}</span></p>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">订单状态</span>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {order.trackingNumber && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">物流信息</p>
          <a href={"https://www.kuaidi100.com/all/" + order.trackingNumber} target="_blank" className="text-sm text-primary hover:underline font-medium">
            物流单号: {order.trackingNumber} → 查看物流
          </a>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">商品清单</h2>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.productId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-xl">🫖</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.product.title_zhCN}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {order.sourceMap?.[item.productId] && (
                  <a
                    href={order.sourceMap[item.productId].sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 hover:underline"
                  >
                    {"天猫下单"} {(order.sourceMap[item.productId].sourceSku ? "#" + order.sourceMap[item.productId].sourceSku : "")}
                  </a>
                )}
                <span className="text-sm font-medium">{_format(item.product.price * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-foreground">收货地址</h2>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="text-foreground font-medium">{order.address.name}</p>
          <p>{order.address.phone}</p>
          <p>{order.address.street}</p>
          <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
          <p>{order.address.country}</p>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-foreground">支付信息</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">小计</span><span className="font-medium">{_format(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">运费</span><span className="font-medium">{order.shipping === 0 ? "免费" : _format(order.shipping)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">税费</span><span className="font-medium">{_format(order.tax)}</span></div>
          <div className="border-t border-border pt-2 flex justify-between text-base">
            <span className="font-medium text-foreground">合计</span>
            <span className="font-bold text-primary">{_format(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/products"><Button variant="outline" className="w-full sm:w-auto">继续购物</Button></Link>
        <Link href="/orders"><Button className="w-full sm:w-auto">查看全部订单</Button></Link>
      </div>
    </div>
  );
}