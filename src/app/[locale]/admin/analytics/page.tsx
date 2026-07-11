"use client";

import { Link } from "@/i18n";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">数据分析</h1>
          <p className="text-sm text-muted-foreground">店铺运营数据统计</p>
        </div>
      </div>

      {/* 当前接入状态 */}
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground mb-1">等待数据收集</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Google Analytics 4 已接入，数据收集需要 24-48 小时才能显示。
              待有真实访客后，此处将自动展示店铺运营数据。
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-foreground">Google Analytics 4 — 已接入（G-OFB70RY8C6）</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-foreground">Google Search Console — 已验证，Sitemap 已提交</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-foreground">PayPal 支付 — 正式模式</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-5 w-5 shrink-0 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full border-2 border-muted-foreground/40" />
            </div>
            <span>Facebook Pixel — 等待注册</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            GA4 数据通常在接入后 24-48 小时开始显示，初期数据量较少。
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}
