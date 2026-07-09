"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { useTranslations } from "next-intl";
import { Eye, Truck, Search, Package, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n";

const STATUS_LABEL: Record<string, string> = { pending: "待付款", paid: "待发货", shipped: "已发货", delivered: "已完成", cancelled: "已取消" };
const STATUS_COLOR: Record<string, string> = { pending: "bg-gray-100 text-gray-700", paid: "bg-yellow-100 text-yellow-700", shipped: "bg-blue-100 text-blue-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };

const STATUSES = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待付款" },
  { key: "paid", label: "待发货" },
  { key: "shipped", label: "已发货" },
  { key: "delivered", label: "已完成" },
];

var mockOrders: any[] = [];

async function fetchOrders(setOrders: any) {
  try {
    var res = await fetch("/api/checkout");
    var data = await res.json();
    if (Array.isArray(data)) setOrders(data);
  } catch(e) {}
}

const CARRIER_NAMES: Record<string, string> = { usps: "USPS", fedex: "FedEx", ups: "UPS", dhl: "DHL Express", dhl_ecommerce: "DHL eCommerce", canada_post: "Canada Post", australia_post: "Australia Post", royal_mail: "Royal Mail", yanwen: "燕文物流", "4px": "递四方", cn_line: "CNE Express", speedpak: "SpeedPak", eub: "易邮宝 (EUB)", sf_international: "顺丰国际", other: "Other Carrier" };

export default function AdminOrdersPage() {
  var router = useRouter();
  var [authorized, setAuthorized] = useState(false);
  var [statusFilter, setStatusFilter] = useState("all");
  var [expandedId, setExpandedId] = useState<string | null>(null);
  var [trackData, setTrackData] = useState<Record<string, any>>({});
  var [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  var [showShipDialog, setShowShipDialog] = useState<string | null>(null);
  var [shipCarrier, setShipCarrier] = useState("usps");
  var [shipNumber, setShipNumber] = useState("");
  var [carriers, setCarriers] = useState([]);
  var [orders, setOrders] = useState(mockOrders);

 useEffect(() => {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); }
    else { setAuthorized(true); fetchCarriers(); fetchOrders(setOrders); }
  }, [router]);

  async function fetchCarriers() {
    try {
      var res = await fetch("/api/shipping?action=carriers");
      var data = await res.json();
      if (data.success) setCarriers(data.carriers);
    } catch(e) {}
  }

  async function handleShip(orderId: string) {
    if (!shipNumber.trim()) return;
    var tn = shipNumber.trim();
    var newOrders = orders.map(function(o: any) {
      if (o.id === orderId) { return { ...o, trackingNumber: tn, carrier: shipCarrier, status: "shipped" }; }
      return o;
    });
    setOrders(newOrders);
    setShowShipDialog(null);
    setShipNumber("");
  }

  async function fetchTracking(orderId: string, carrier: string, number: string) {
    if (!number) return;
    setTrackingLoading(function(prev) { return { ...prev, [orderId]: true }; });
    try {
      var res = await fetch("/api/shipping?action=track&number=" + encodeURIComponent(number) + "&carrier=" + encodeURIComponent(carrier || ""));
      var data = await res.json();
      if (data.success) {
        setTrackData(function(prev) { return { ...prev, [orderId]: data }; });
      }
    } catch(e) {}
    setTrackingLoading(function(prev) { return { ...prev, [orderId]: false }; });
  }

  var filtered = orders.filter(function(o) { return statusFilter === "all" || o.status === statusFilter; });

  if (!authorized) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5"><Truck className="h-6 w-6 text-primary" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">订单管理</h1><p className="text-sm text-muted-foreground">管理订单发货和物流</p></div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {STATUSES.map(function(f: any) {
            return (
              <button key={f.key} onClick={function() { setStatusFilter(f.key); }}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " + (statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
              {f.label}
            </button>
            );
          })}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={function() { fetchOrders(setOrders); }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
            &#x21bb; 刷新
          </button>
          <button onClick={async function() {
            if (confirm("确定要清空全部订单吗？此操作不可恢复。")) {
              var res = await fetch("/api/checkout", { method: "DELETE" });
              var data = await res.json();
              if (data.success) {
                setOrders([]);
                alert("全部订单已清空");
              } else {
                alert("清空失败");
              }
            }
          }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
            &#x2716; 清空全部订单
          </button>
        </div>
      </div>
  
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              {["订单号", "客户", "联系方式", "金额", "利润", "下单时间", "状态", "物流", "操作"].map(function(h: string) {
                return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
          {filtered.map(function(o: any) {
            const customerName = o.customer || o.address?.name || "-";
            const contactInfo = (o.contactMethod && o.contactMethod !== "email")
              ? o.contactMethod.toUpperCase() + ": " + (o.contactId || "-")
              : "Email: " + (o.contactId || (o.email) || "-");
            const profitVal = o.profit != null ? o.profit : 0;
              return (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{o.id}</td>
                  <td className="px-4 py-3 text-sm">{customerName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{contactInfo}</td>
                  <td className="px-4 py-3 text-sm font-medium">¥{Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">¥{Number(profitVal).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (STATUS_COLOR[o.status] || "")}>{STATUS_LABEL[o.status] || o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {o.trackingNumber ? (
                      <div>
                        <span className="text-muted-foreground">{CARRIER_NAMES[o.carrier] || o.carrier}</span>
                        <span className="ml-1 font-mono text-[10px] text-muted-foreground">{o.trackingNumber}</span>
                        <button onClick={function() { fetchTracking(o.id, o.carrier, o.trackingNumber); setExpandedId(expandedId === o.id ? null : o.id); }}
                          className="ml-2 text-primary hover:underline text-[10px]">
                          查询
                        </button>
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "paid" ? (
                      <button onClick={function() { setShowShipDialog(o.id); setShipCarrier("usps"); setShipNumber(""); }}
                        className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                        <Package className="h-3 w-3" /> 发货
                      </button>
                    ) : o.status === "shipped" ? (
                      <span className="text-xs text-muted-foreground">运输中</span>
                    ) : o.status === "delivered" ? (
                      <span className="text-xs text-green-600">已完成</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

            {/* Expanded tracking detail */}
      {expandedId && trackData[expandedId] ? (function() {
        var data = trackData[expandedId];
        return (
          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">物流轨迹 - {expandedId}</h3>
            </div>
            <div className="space-y-3">
              {data.traces.map(function(t: any, i: number) {
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={"w-2.5 h-2.5 rounded-full " + (i === 0 ? "bg-primary" : "bg-muted-foreground/30")} />
                      {i < data.traces.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-foreground">{t.desc}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })() : expandedId && trackingLoading[expandedId] ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">查询物流中...</p>
        </div>
      ) : null}{/* Ship Dialog */}
      {showShipDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={function(e) { if (e.target === e.currentTarget) setShowShipDialog(null); }}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-foreground mb-4">发货 - {showShipDialog}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">快递公司</label>
                <select value={shipCarrier} onChange={function(e) { setShipCarrier(e.target.value); }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  {carriers.map(function(c: any) {
                    return <option key={c.id} value={c.id}>{c.name}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">物流单号</label>
                <input type="text" value={shipNumber} onChange={function(e) { setShipNumber(e.target.value); }}
                  placeholder="请输入快递单号"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={function() { setShowShipDialog(null); }}
                  className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">取消</button>
                <button onClick={function() { handleShip(showShipDialog as string); }} disabled={!shipNumber.trim()}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">确认发货</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
