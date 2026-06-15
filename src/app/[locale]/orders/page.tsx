"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { Link } from "@/i18n";
import { Button } from "@/components/ui/Button";

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="flex items-center justify-center min-h-\[60vh\]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground mb-8">我的订单</h1>

      {user?.role === "admin" && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground mb-3">管理员选项</p>
          <Link href="/admin/orders"><Button variant="outline" size="sm">管理所有订单</Button></Link>
        </div>
      )}

      {(!user?.orders || user.orders.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-4">暂无订单</p>
          <Link href="/products"><Button variant="default">去购物</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {user.orders.map((oid: string) => (
            <Link key={oid} href={"/orders/" + oid} className="block rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
              <p className="font-medium text-foreground">订单 #{oid}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}