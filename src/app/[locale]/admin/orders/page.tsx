"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { useTranslations } from "next-intl";
import { Eye, ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n";

var mockOrders = [
  { id: "ORD-001", customer: "王小明", email: "wang@example.com", phone: "+86 139****1234", items: 2, total: 1990, cost: 120, profit: 1870, status: "pending", createdAt: "2026-06-15 09:30", sourceMap: {} },
  { id: "ORD-002", customer: "李芳", email: "li@example.com", phone: "+86 138****5678", items: 1, total: 2620, cost: 180, profit: 2440, status: "paid", createdAt: "2026-06-14 14:20", sourceMap: {} },
  { id: "ORD-003", customer: "陈伟", email: "chen@example.com", phone: "+1 415***8901", items: 2, total: 7670, cost: 440, profit: 7230, status: "paid", createdAt: "2026-06-13 10:15", sourceMap: {} },
  { id: "ORD-004", customer: "赵丽", email: "zhao@example.com", phone: "+86 186****2345", items: 1, total: 1740, cost: 95, profit: 1645, status: "shipped", createdAt: "2026-06-12 16:45", trackingNumber: "SF1234567890" },
  { id: "ORD-005", customer: "刘洋", email: "liu@example.com", phone: "+86 137****6789", items: 2, total: 4770, cost: 310, profit: 4460, status: "shipped", createdAt: "2026-06-11 11:30", trackingNumber: "SF1234567891" },
  { id: "ORD-006", customer: "张敏", email: "zhangm@example.com", phone: "+65 9***1234", items: 1, total: 2600, cost: 160, profit: 2440, status: "delivered", createdAt: "2026-06-10 09:00", trackingNumber: "SF1234567892" },
  { id: "ORD-007", customer: "黄蓉", email: "huang@example.com", phone: "+86 133****8888", items: 1, total: 2620, cost: 180, profit: 2440, status: "delivered", createdAt: "2026-06-08 14:10", trackingNumber: "SF1234567893" },
];

var statusLabel: Record<string, string> = { pending: "待付款", paid: "待发货", shipped: "已发货", delivered: "已完成", cancelled: "已取消" };

function filterOrders(orders: any[], status: string) {
  if (status === "all") return orders;
  return orders.filter(function(o) { return o.status === status; });
}

var statusFilters = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待付款" },
  { key: "paid", label: "待发货" },
  { key: "shipped", label: "已发货" },
  { key: "delivered", label: "已完成" },
];

export default function AdminOrdersPage() {
  var router = useRouter();
  var t = useTranslations("admin");
  var _useState = useState<any>(false), authorized = _useState[0], setAuthorized = _useState[1];
  var _useState2 = useState("all"), statusFilter = _useState2[0], setStatusFilter = _useState2[1];

  useEffect(function() {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); }
    else { setAuthorized(true); }
  }, [router]);

  var handleShip = function(id: string) {
    var tn = window.prompt("请输入物流单号:");
    if (tn !== null && tn.trim() !== "") {
      var trackNum = tn.trim();
      mockOrders.forEach(function(o) { if (o.id === id) { o.trackingNumber = trackNum; o.status = "shipped"; } });
      setStatusFilter(statusFilter);
    }
  };

  if (!authorized) return React.createElement("div", { className: "flex items-center justify-center min-h-\[60vh\]" }, React.createElement("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }));

  var filteredOrders = filterOrders(mockOrders, statusFilter);

  return React.createElement("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" },
    React.createElement("h1", { className: "text-2xl font-bold text-foreground mb-6" }, "订单管理"),
    React.createElement("div", { className: "flex gap-2 mb-6 overflow-x-auto" },
      statusFilters.map(function(f) {
        return React.createElement("button", {
          key: f.key,
          onClick: function() { setStatusFilter(f.key); },
          className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " + (statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")
        }, f.label);
      })
    ),
    React.createElement("div", { className: "rounded-lg border border-border bg-card overflow-hidden" },
      React.createElement("table", { className: "w-full text-sm" },
        React.createElement("thead", { className: "bg-muted/50" },
          React.createElement("tr", { className: "border-b border-border" },
            ["订单号", "客户", "金额", "利润", "下单时间", "状态", "操作"].map(function(h) {
              return React.createElement("th", { key: h, className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground" }, h);
            })
          )
        ),
        React.createElement("tbody", { className: "divide-y divide-border" },
          filteredOrders.map(function(o) {
            return React.createElement("tr", { key: o.id, className: "hover:bg-muted/30" },
              React.createElement("td", { className: "px-4 py-3 text-sm font-medium" }, o.id),
              React.createElement("td", { className: "px-4 py-3 text-sm" }, o.customer),
              React.createElement("td", { className: "px-4 py-3 text-sm font-medium" }, "¥" + Number(o.total).toFixed(2)),
              React.createElement("td", { className: "px-4 py-3 text-sm font-medium text-green-600" }, "¥" + Number(o.profit).toFixed(2)),
              React.createElement("td", { className: "px-4 py-3 text-xs text-muted-foreground" }, o.createdAt),
              React.createElement("td", { className: "px-4 py-3" },
                React.createElement("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full " + (o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : o.status === "paid" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700") }, statusLabel[o.status] || o.status)
              ),
              React.createElement("td", { className: "px-4 py-3" },
                o.status === "paid" ? React.createElement("button", {
                  onClick: function() { handleShip(o.id); },
                  className: "text-xs text-primary hover:underline font-medium"
                }, "手动发货") : null,
                o.trackingNumber ? React.createElement("a", {
                  href: "https://www.kuaidi100.com/all/" + o.trackingNumber,
                  target: "_blank",
                  className: "text-xs text-primary hover:underline font-medium"
                }, o.trackingNumber) : null
              )
            );
          })
        )
      )
    )
  );
}