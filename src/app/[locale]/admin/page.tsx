"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { Package, ShoppingCart, ClipboardList, Users, AlertCircle } from "lucide-react";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/admin/products", label: "商品管理", icon: Package, desc: "管理191件商品", color: "text-blue-600", bg: "bg-blue-100" },
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

      {/* 暂无数据提示 */}
      <div className="mb-8 rounded-xl border border-border bg-card p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">暂无运营数据</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              网站尚未正式上线运营，暂无真实订单与访客数据。
              待 Google Analytics 4 收集到数据后，此处将自动展示运营概况。
            </p>
          </div>
        </div>
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
    </div>
  );
}

function Loading() {
  return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
}
