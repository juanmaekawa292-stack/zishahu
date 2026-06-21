"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Users, Globe, Calendar, ChevronDown } from "lucide-react";
import { Link } from "@/i18n";
import { cn } from "@/lib/utils";

const DATE_RANGES = [
  { key: "today", label: "今天" },
  { key: "7d", label: "近7天" },
  { key: "30d", label: "近30天" },
  { key: "custom", label: "自定义" },
];

const REGION_DATA = [
  { region: "美国", count: 1245, pct: 32 },
  { region: "加拿大", count: 423, pct: 10.9 },
  { region: "英国", count: 387, pct: 9.9 },
  { region: "澳大利亚", count: 312, pct: 8 },
  { region: "德国", count: 267, pct: 6.9 },
  { region: "日本", count: 198, pct: 5.1 },
  { region: "新加坡", count: 156, pct: 4 },
  { region: "法国", count: 134, pct: 3.4 },
  { region: "韩国", count: 98, pct: 2.5 },
  { region: "台湾", count: 76, pct: 2 },
];

const PERIOD_STATS: Record<string, any> = {
  today: {
    revenue: "$1,245", orders: "8", rate: "3.8%", users: "42",
    revChange: "+5.2%", ordChange: "+2", rateChange: "+0.3%", usrChange: "+8",
  },
  "7d": {
    revenue: "$8,920", orders: "62", rate: "3.5%", users: "312",
    revChange: "+12.5%", ordChange: "+8.3%", rateChange: "+0.5%", usrChange: "+15.2%",
  },
  "30d": {
    revenue: "$32,450", orders: "218", rate: "3.2%", users: "1,245",
    revChange: "+15.2%", ordChange: "+10.1%", rateChange: "+0.2%", usrChange: "+22.1%",
  },
};

const UNIT_SALES = [
  { name: "景舟石瓢壶 260ml", sales: 28, change: "+15%" },
  { name: "仿古如意壶 350ml", sales: 22, change: "+8%" },
  { name: "西施壶 220ml", sales: 19, change: "+12%" },
  { name: "汉瓦壶 200ml", sales: 15, change: "-5%" },
  { name: "德钟壶 300ml", sales: 12, change: "+20%" },
];

export default function AdminAnalyticsPage() {
  var [range, setRange] = useState("30d");
  var stats = PERIOD_STATS[range] || PERIOD_STATS["30d"];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">数据分析</h1>
          <p className="text-sm text-muted-foreground">店铺运营数据统计</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {DATE_RANGES.map(function(d) {
            return (
              <button key={d.key} onClick={function() { setRange(d.key); }}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition-colors",
                  range === d.key ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "销售额", value: stats.revenue, change: stats.revChange, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "订单数", value: stats.orders, change: stats.ordChange, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "转化率", value: stats.rate, change: stats.rateChange, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "访客数", value: stats.users, change: stats.usrChange, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
        ].map(function(s) {
          var isUp = s.change.startsWith("+");
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("rounded-lg p-2.5", s.bg)}><s.icon className={cn("h-5 w-5", s.color)} /></div>
                <span className={cn("text-xs font-medium", isUp ? "text-emerald-600" : "text-red-500")}>{s.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Two columns: Sales Trend + Region Distribution */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Sales Trend Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            销售额趋势
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {[12, 18, 15, 22, 28, 24, 32].map(function(val, idx) {
              var maxVal = 32;
              var heightPct = (val / maxVal) * 100;
              var labels = ["06/15","06/16","06/17","06/18","06/19","06/20","06/21"];
              var vals = ["$12K","$18K","$15K","$22K","$28K","$24K","$32K"];
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-muted-foreground">{vals[idx]}</span>
                  <div className="w-full rounded-t bg-primary/80 hover:bg-primary transition-all cursor-pointer"
                    style={{ height: heightPct + "%" }} />
                  <span className="text-[10px] text-muted-foreground">{labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Region Distribution */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            访问地区分布（Top 10）
          </h3>
          <div className="space-y-2.5">
            {REGION_DATA.map(function(r) {
              return (
                <div key={r.region} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-16 shrink-0">{r.region}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full flex items-center justify-end px-2 transition-all"
                      style={{ width: r.pct + "%", minWidth: r.pct > 15 ? "40px" : "0" }}>
                      {r.pct > 15 && <span className="text-[10px] text-primary-foreground font-medium">{r.pct}%</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-14 text-right shrink-0">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Best Selling Products */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            热销商品（近{range === "today" ? "1" : range === "7d" ? "7" : "30"}天）
          </h3>
        </div>
        <div className="divide-y divide-border">
          {UNIT_SALES.map(function(p, i) {
            var maxSales = Math.max(...UNIT_SALES.map(function(x) { return x.sales; }));
            var pct = (p.sales / maxSales) * 100;
            var isUp = p.change.startsWith("+");
            return (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-foreground">{p.name}</p>
                    <span className={cn("text-xs font-medium", isUp ? "text-emerald-600" : "text-red-500")}>{p.change}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: pct + "%",
                      backgroundColor: i === 0 ? "var(--primary)" : i === 1 ? "var(--primary)" : "var(--muted-foreground)",
                      opacity: 1 - i * 0.15
                    }} />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground w-12 text-right">{p.sales}件</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}