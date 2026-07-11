"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, AlertCircle, Search } from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { cn } from "@/lib/utils";

export default function AdminCustomersPage() {
  var router = useRouter();
  var [authorized, setAuthorized] = useState(false);

  useEffect(function() {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") router.push("/login");
    else setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-2.5">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">客户管理</h1>
          <p className="text-sm text-muted-foreground">客户数据管理</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">暂无客户数据</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              网站尚未正式上线运营，暂无真实客户数据。
              待有真实订单后，客户信息将自动显示在此处。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
