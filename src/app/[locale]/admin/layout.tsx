"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n";
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  CreditCard, MessageSquare, ClipboardList, Settings, Menu, X, LogOut, ChevronDown
} from "lucide-react";

var navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingCart },
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/customers", label: "客户管理", icon: Users },
  { href: "/admin/analytics", label: "数据分析", icon: BarChart3 },
  { href: "/admin/payment", label: "支付设置", icon: CreditCard },
  { href: "/admin/service", label: "客服工单", icon: MessageSquare },
  { href: "/admin/product-ops", label: "上架工具", icon: ClipboardList },
  { href: "/admin/settings", label: "店铺设置", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  var pathname = usePathname();
  var [sidebarOpen, setSidebarOpen] = useState(false);
  var [authorized, setAuthorized] = useState<boolean | null>(null);
  var router = useRouter();

  useEffect(function() {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") router.push("/login");
    else setAuthorized(true);
  }, [router]);

  if (authorized === null) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-card border-b border-border px-4 py-3">
        <button onClick={function() { setSidebarOpen(true); }} className="p-1 text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-primary">紫砂雅集</span>
        <Link href="/" className="text-xs text-muted-foreground hover:text-primary">前台</Link>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={function() { setSidebarOpen(false); }} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl">🫖</span>
              <span className="text-sm font-bold text-primary">紫砂雅集</span>
            </Link>
            <button onClick={function() { setSidebarOpen(false); }} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(function(item) {
              var active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    active ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={function() { setSidebarOpen(false); }}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-border px-3 py-3">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <LogOut className="h-4 w-4" />
              返回前台
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}