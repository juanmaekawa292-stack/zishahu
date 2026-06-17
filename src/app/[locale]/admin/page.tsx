"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";

import { useTranslations } from "next-intl";
import { Package, ShoppingCart, TrendingUp, Users, Plus, List, ClipboardList, CreditCard } from "lucide-react";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";

const stats = [
  { key: "totalOrders", value: "156", change: "+12%", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { key: "totalRevenue", value: "$48,920", change: "+8.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { key: "totalProducts", value: "38", change: "+3", icon: Package, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { key: "totalUsers", value: "892", change: "+45", icon: Users, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

const recentOrders = [
  { id: "ORD-001", customer: "王小明", total: "$1,280", status: "pending", date: "2026-06-12" },
  { id: "ORD-002", customer: "李芳", total: "$980", status: "paid", date: "2026-06-11" },
  { id: "ORD-003", customer: "陈伟", total: "$2,680", status: "shipped", date: "2026-06-10" },
];

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  paid: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  shipped: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  delivered: "text-green-600 bg-green-100 dark:bg-green-900/30",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  const t = useTranslations("admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">欢迎回来，今天是 {new Date().toLocaleDateString("zh-CN")}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("rounded-lg p-2", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{t(stat.key)}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/products" className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
          <div className="rounded-lg bg-primary/10 p-3"><Package className="h-6 w-6 text-primary" /></div>
          <div><h3 className="text-sm font-medium text-foreground">{t("products")}</h3><p className="text-xs text-muted-foreground">管理商品信息、库存和图片</p></div>
        </Link>
        <Link href="/admin/orders" className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
          <div className="rounded-lg bg-secondary/10 p-3"><ShoppingCart className="h-6 w-6 text-secondary" /></div>
          <div><h3 className="text-sm font-medium text-foreground">{t("orders")}</h3><p className="text-xs text-muted-foreground">查看和处理客户订单</p></div>
        </Link>
        <Link href="/admin/product-ops" className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
          <div className="rounded-lg bg-amber-100 p-3"><ClipboardList className="h-6 w-6 text-amber-600" /></div>
          <div><h3 className="text-sm font-medium text-foreground">商品运营</h3><p className="text-xs text-muted-foreground">采集→加工→上架管线管理</p></div>
        </Link>
</div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-medium text-foreground">最近订单</h2>
          <Link href="/admin/orders" className="text-xs text-primary hover:underline">查看全部</Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{order.customer}</p>
                <p className="text-xs text-muted-foreground">{order.id} | {order.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{order.total}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusColors[order.status])}>
                  {order.status === "pending" ? "待付款" : order.status === "paid" ? "已付款" : "已发货"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
        
