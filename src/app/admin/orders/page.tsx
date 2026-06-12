"use client";

import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n";

const mockOrders = [
  { id: "ORD-001", customer: "王小明", email: "wang@example.com", items: 2, total: 1397.4, status: "pending", date: "2026-06-12" },
  { id: "ORD-002", customer: "李芳", email: "li@example.com", items: 1, total: 980, status: "paid", date: "2026-06-11" },
  { id: "ORD-003", customer: "陈伟", email: "chen@example.com", items: 1, total: 2680, status: "shipped", date: "2026-06-10" },
  { id: "ORD-004", customer: "赵丽", email: "zhao@example.com", items: 3, total: 520, status: "delivered", date: "2026-06-08" },
  { id: "ORD-005", customer: "刘洋", email: "liu@example.com", items: 2, total: 1840, status: "cancelled", date: "2026-06-07" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "success" }> = {
  pending: { label: "待付款", variant: "warning" },
  paid: { label: "已付款", variant: "default" },
  shipped: { label: "已发货", variant: "default" },
  delivered: { label: "已送达", variant: "success" },
  cancelled: { label: "已取消", variant: "secondary" },
};

export default function AdminOrdersPage() {
  const t = useTranslations("admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("orders")}</h1>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">订单号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">客户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">商品数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockOrders.map((order) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{order.items}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.date}</td>
                  <td className="px-4 py-3"><Badge variant={status.variant} className="text-[10px]">{status.label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}