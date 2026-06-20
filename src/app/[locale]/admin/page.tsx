"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { useTranslations } from "next-intl";
import { Package, ShoppingCart, TrendingUp, Users, Plus, List, ClipboardList, CreditCard, Globe, Eye, DollarSign, ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/admin/products", label: "商品管理", icon: Package, desc: "管理192件商品", color: "text-blue-600", bg: "bg-blue-100" },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingCart, desc: "查看处理订单", color: "text-emerald-600", bg: "bg-emerald-100" },
  { href: "/admin/customers", label: "客户管理", icon: Users, desc: "客户数据分析", color: "text-purple-600", bg: "bg-purple-100" },
  { href: "/admin/product-ops", label: "上架工具", icon: ClipboardList, desc: "采集→上架", color: "text-amber-600", bg: "bg-amber-100" },
];

export default function AdminDashboard() {
  var router = useRouter();
  var [authorized, setAuthorized] = useState(false);

  useEffect(function() {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") router.push("/login");
    else setAuthorized(true);
  }, [router]);

  if (!authorized) return <Loading />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">紫砂雅集店铺运营概览 — {new Date().toLocaleDateString("zh-CN")}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "本月销售额", value: "$48,920", change: "+12.5%", up: true, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "本月订单", value: "156", change: "+8.3%", up: true, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "访问用户", value: "3,892", change: "-2.1%", up: false, icon: Eye, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "转化率", value: "4.01%", change: "+0.8%", up: true, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
        ].map(function(s) {
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("rounded-lg p-2.5", s.bg)}><s.icon className={cn("h-5 w-5", s.color)} /></div>
                <span className={cn("text-xs font-medium flex items-center gap-0.5", s.up ? "text-emerald-600" : "text-red-500")}>
                  {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{s.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(function(l) {
          return (
            <Link key={l.href} href={l.href} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className={cn("rounded-lg p-3", l.bg)}><l.icon className={cn("h-6 w-6", l.color)} /></div>
              <div><h3 className="text-sm font-medium text-foreground">{l.label}</h3><p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p></div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders + Popular Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders />
        <PopularProducts />
      </div>
    </div>
  );
}

function Loading() {
  return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
}

function RecentOrders() {
  var orders = [
    { id: "ORD-006", customer: "Ming Zhang", total: 95.00, status: "delivered", date: "2026-06-10", carrier: "DHL" },
    { id: "ORD-005", customer: "David Liu", total: 198.00, status: "shipped", date: "2026-06-14", carrier: "FedEx" },
    { id: "ORD-004", customer: "Emily Zhao", total: 120.00, status: "shipped", date: "2026-06-16", carrier: "USPS" },
    { id: "ORD-003", customer: "James Chen", total: 215.00, status: "paid", date: "2026-06-18" },
    { id: "ORD-002", customer: "Sarah Li", total: 88.50, status: "paid", date: "2026-06-19" },
  ];
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" />最近订单</h2>
        <Link href="/admin/orders" className="text-xs text-primary hover:underline">查看全部</Link>
      </div>
      <div className="divide-y divide-border">
        {orders.map(function(o) {
          var sc = o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";
          var sl = o.status === "delivered" ? "已完成" : o.status === "shipped" ? "已发货" : "待发货";
          return (
            <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <div><p className="text-sm font-medium text-foreground">{o.customer}</p><p className="text-xs text-muted-foreground">{o.id} {o.carrier ? "| " + o.carrier : ""} | {o.date}</p></div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">${o.total.toFixed(2)}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", sc)}>{sl}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PopularProducts() {
  var products = [
    { name: "景舟石瓢壶 260ml", sales: 28, revenue: 7854, trend: "up" },
    { name: "仿古如意壶 350ml", sales: 22, revenue: 6160, trend: "up" },
    { name: "西施壶 220ml", sales: 19, revenue: 4370, trend: "up" },
    { name: "汉瓦壶 200ml", sales: 15, revenue: 3600, trend: "down" },
    { name: "德钟壶 300ml", sales: 12, revenue: 3120, trend: "up" },
  ];
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />热销商品</h2>
      </div>
      <div className="divide-y divide-border">
        {products.map(function(p, i) {
          var max = 28;
          var pct = (p.sales / max) * 100;
          return (
            <div key={i} className="px-5 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-foreground">{p.name}</p>
                <span className="text-xs text-muted-foreground">${p.revenue.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{width: pct + "%"}} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{p.sales}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}