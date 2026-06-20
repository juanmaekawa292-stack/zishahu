"use client";

import { useEffect, useState } from "react";
import {
  Package, FileText, Image, Download, RefreshCw, ExternalLink,
  CheckCircle, Clock, AlertTriangle, DollarSign, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n";

interface RawProduct {
  source_title: string;
  source_price: number;
  source_sku: string;
  source_url: string;
  category: string;
  file: string;
}

interface ProcessedProduct {
  id: string;
  slug: string;
  title_zhCN: string;
  title_zhTW: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  sourceSku: string;
  sourceUrl: string;
  _pricing?: { coefficient: number; rmbOriginal: number; bracket: string };
  createdAt: string;
}

interface Stats {
  rawCount: number;
  processedCount: number;
  exportCount: number;
  pendingReview: number;
}

export default function ProductOpsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rawProducts, setRawProducts] = useState<RawProduct[]>([]);
  const [processedProducts, setProcessedProducts] = useState<ProcessedProduct[]>([]);
  const [exports, setExports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "raw" | "processed" | "exports">("dashboard");

  useEffect(() => {
    fetch("/api/product-ops")
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setRawProducts(data.rawProducts || []);
        setProcessedProducts(data.processedProducts || []);
        setExports(data.exports || []);
      })
      .catch(e => console.error("Failed to load product ops data:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleProcessProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/product-ops/process", { method: "POST" });
      const data = await res.json();
      alert(data.message || "处理完成!");
      window.location.reload();
    } catch (e: any) {
      alert("处理失败: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-12 text-center text-muted-foreground">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
        <p>正在加载数据...</p>
      </div>
    );
  }

  const statCards = [
    { label: "待处理", value: stats?.rawCount ?? 0, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "已加工", value: stats?.processedCount ?? 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "待审核", value: stats?.pendingReview ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "导出日志", value: stats?.exportCount ?? 0, icon: Download, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const tabs = [
    { key: "dashboard" as const, label: "概览", icon: Package },
    { key: "raw" as const, label: "加工完成 (" + (stats?.rawCount ?? 0) + ")", icon: FileText },
    { key: "processed" as const, label: "采集数据 (" + (stats?.processedCount ?? 0) + ")", icon: CheckCircle },
    { key: "exports" as const, label: "导出记录", icon: Download },
  ];

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">商品运营</h1>
          <p className="text-sm text-muted-foreground mt-1">
            采集→加工→上架，全链路商品管线 就绪
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleProcessProducts} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
            开始加工
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("rounded-lg p-2", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pipeline Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">管线状态</h2>
            <div className="space-y-3">
              {[
                { step: "采集", status: rawProducts.length > 0 ? "completed" : "waiting", icon: Package, desc: rawProducts.length > 0 ? rawProducts.length + " 个原始商品" : "等待 Thread 2 数据" },
                { step: "加工", status: stats && stats.processedCount > 0 ? "completed" : rawProducts.length > 0 ? "ready" : "waiting", icon: FileText, desc: stats && stats.processedCount > 0 ? stats.processedCount + " 个已加工" : rawProducts.length > 0 ? "等待加工" : "等待数据" },
                { step: "图片处理", status: "ready", icon: Image, desc: "Sharp 已就绪 1200×1200 WebP" },
                { step: "上架导出", status: exports.length > 0 ? "completed" : "ready", icon: ShoppingCart, desc: exports.length > 0 ? "已导出 " + exports.length + " 个批次" : "Shopify CSV 就绪" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-full p-1.5",
                    item.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                    item.status === "ready" ? "bg-amber-100 text-amber-600" :
                    "bg-gray-100 text-gray-400"
                  )}>
                    {item.status === "completed" ? <CheckCircle className="h-4 w-4" /> :
                     item.status === "ready" ? <Clock className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.step}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Badge variant={
                    item.status === "completed" ? "success" :
                    item.status === "ready" ? "warning" : "secondary"
                  } className="text-[10px]">
                    {item.status === "completed" ? "已完成" :
                     item.status === "ready" ? "就绪" : "等待中"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">管线状态</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={handleProcessProducts} disabled={rawProducts.length === 0}>
                <RefreshCw className="h-4 w-4 mr-2" />
                加工所有待处理商品
                {rawProducts.length > 0 && <Badge className="ml-auto">{rawProducts.length}</Badge>}
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("exports")} disabled={exports.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                下载最新 CSV
              </Button>
              <a href="/admin/products" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  管理已上架商品
                </Button>
              </a>
            </div>
          </div>

          {/* Recent Processed Products */}
          <div className="rounded-lg border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">最近已加工商品</h2>
              <button onClick={() => setActiveTab("processed")} className="text-xs text-primary hover:underline">
                查看全部
              </button>
            </div>
            <div className="divide-y divide-border">
              {processedProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-lg shrink-0">
                      壶
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title_zhCN}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.id} | {p._pricing ? "¥" + p._pricing.rmbOriginal + " ×" + p._pricing.coefficient : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                    <Badge variant={
                      p.stock > 0 ? "success" : "secondary"
                    } className="text-[10px]">
                      {p.stock > 0 ? "有货" : "无货"}
                    </Badge>
                  </div>
                </div>
              ))}
              {processedProducts.length === 0 && (
                <p className="p-8 text-center text-sm text-muted-foreground">暂无已加工商品</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw Products Tab */}
      {activeTab === "raw" && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              采集数据源 data/raw_products/ 共 {rawProducts.length} 个商品
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">商品标题</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">价格</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">货号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">分类</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">来源</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rawProducts.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground max-w-[280px] truncate">
                      {item.source_title}
                    </td>
                    <td className="px-4 py-3 text-sm">{"¥" + (item.source_price ?? "-")}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{item.source_sku || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">{item.category || "未分类"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[160px] truncate">
                      {item.source_url ? (
                        <a href={item.source_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> 查看
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.file}</td>
                  </tr>
                ))}
                {rawProducts.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    暂无采集数据，等待 Thread 2 推送至 data/raw_products/
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Processed Products Tab */}
      {activeTab === "processed" && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              已加工商品 data/processed_products/ 共 {processedProducts.length} 个已加工 | 定价 10x
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">原价</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">售价</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">划线价</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">系数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">货号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">库存</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">分类</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {processedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground max-w-[240px] truncate">
                      <span title={p.title_zhCN}>{p.title_zhCN}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {p._pricing ? "¥" + p._pricing.rmbOriginal : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground line-through">
                      {p.originalPrice ? formatPrice(p.originalPrice) : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs">{p._pricing ? p._pricing.coefficient + "x" : "-"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.sourceSku || "-"}</td>
                    <td className="px-4 py-3 text-xs">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                    </td>
                  </tr>
                ))}
                {processedProducts.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    暂无已加工商品，请先运行 node scripts/process-product.js 处理
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exports Tab */}
      {activeTab === "exports" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Shopify CSV 导出文件</h2>
          {exports.length > 0 ? (
            <div className="space-y-2">
              {exports.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <Download className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.includes("zhCN") ? "简体中文版" : f.includes("zhTW") ? "繁体中文版" : ""}
                      </p>
                    </div>
                  </div>
                  <a
                    href={"/data/exports/" + f}
                    download
                    className="text-xs text-primary hover:underline"
                  >
                    下载
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              采集→加工→上架，全链路商品管线 就绪 Shopify CSV
            </p>
          )}
          <div className="mt-4">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              返回管理后台
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}