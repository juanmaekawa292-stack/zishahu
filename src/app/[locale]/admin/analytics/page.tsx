"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";

const charts = [
  { title: "销售额趋势", raw: [12, 18, 15, 22, 28, 24, 32], suffix: "K", labels: ["12K", "18K", "15K", "22K", "28K", "24K", "32K"] },
  { title: "订单量趋势", raw: [45, 62, 58, 75, 82, 70, 95], suffix: "", labels: ["45", "62", "58", "75", "82", "70", "95"] },
];

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("analytics")}</h1>
        <p className="text-sm text-muted-foreground">最近30天数据概览</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "本月销售额", value: "$32,450", change: "+15.2%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "本月订单", value: "95", change: "+8.3%", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "转化率", value: "3.2%", change: "+0.5%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
          { label: "新增用户", value: "128", change: "+22.1%", icon: Users, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("rounded-lg p-2", stat.bg)}><stat.icon className={cn("h-5 w-5", stat.color)} /></div>
              <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {charts.map((chart) => {
          const maxVal = Math.max(...chart.raw);
          return (
            <div key={chart.title} className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">{chart.title}</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {chart.raw.map((val, idx) => {
                  const heightPct = (val / maxVal) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] text-muted-foreground">{chart.labels[idx]}</span>
                      <div
                        className="w-full rounded-t transition-all"
                        style={{ height: heightPct + "%", backgroundColor: "var(--primary)" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>06/01</span><span>06/05</span><span>06/10</span><span>06/15</span><span>06/20</span><span>06/25</span><span>06/30</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}