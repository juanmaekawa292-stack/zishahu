"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Users, Globe, AlertCircle } from "lucide-react";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";

export default function AdminAnalyticsPage() {

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">数据分析</h1>
          <p className="text-sm text-muted-foreground">店铺运营数据统计（开发中）</p>
        </div>
      </div>

      {/* 等待真实数据提示 */}
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">暂无真实数据</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              网站尚未正式上线运营，暂未接入真实订单与访客数据。
              待独立站正式上线并接入 Google Analytics 和 PayPal 支付后，
              此处将自动展示店铺运营数据。
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 justify-center">
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-0.5">待完成：</p>
              <p>1. 接入 Google Analytics 4</p>
              <p>2. 接入 Facebook Pixel</p>
              <p>3. PayPal 切换为正式模式</p>
              <p>4. 提交 Sitemap 到 Google Search Console</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}
