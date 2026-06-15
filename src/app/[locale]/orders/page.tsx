"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { Link } from "@/i18n";

var MOCK_ORDERS = [
  { id: "ORD-20260601", customer: "王晓星", email: "wang@example.com", phone: "+86 139****1234", address: "北京市朝阳区建国路88号", items: [{ name: "古悦堂归兽壶套装", qty: 1, price: 1990 }], total: 1990, status: "delivered", date: "2026-06-15", trackingNumber: "SF1234567890" },
  { id: "ORD-20260602", customer: "李芳", email: "li@example.com", phone: "+86 138****5678", address: "上海市浦东新区陆家嘴环路1000号", items: [{ name: "颐壶春汉瓦壶", qty: 1, price: 2620 }], total: 2620, status: "delivered", date: "2026-06-14" },
  { id: "ORD-20260603", customer: "陈伟", email: "chen@example.com", phone: "+1 415***8901", address: "123 Main St, San Francisco, CA 94102 USA", items: [{ name: "戴晨光西施壶220ml", qty: 1, price: 5650 }, { name: "石瓢壶彩绘款单壶", qty: 1, price: 2020 }], total: 7670, status: "shipped", date: "2026-06-12", trackingNumber: "SF1234567891" },
  { id: "ORD-20260604", customer: "赵丽", email: "zhao@example.com", phone: "+86 186****2345", address: "广州市天河区体育西路100号", items: [{ name: "大容量430ml西施壶描金", qty: 1, price: 830 }, { name: "祥龙仿古壶礼盒装", qty: 1, price: 910 }], total: 1740, status: "paid", date: "2026-06-10" },
  { id: "ORD-20260605", customer: "刘洋", email: "liu@example.com", phone: "+86 137****6789", address: "深圳市南山区科技园南路1号", items: [{ name: "2026新款仿古壶350cc", qty: 1, price: 2460 }], total: 2460, status: "pending", date: "2026-06-08" },
  { id: "ORD-20260606", customer: "王大明", email: "wangdm@example.com", phone: "+86 159****4567", address: "杭州市西湖区文三路200号", items: [{ name: "古悦堂名家如意西施壶", qty: 1, price: 2600 }], total: 2600, status: "shipped", date: "2026-06-05", trackingNumber: "SF1234567892" },
  { id: "ORD-20260607", customer: "张敏", email: "zhangm@example.com", phone: "+65 9***1234", address: "1 Raffles Place, Singapore 048616", items: [{ name: "石瓢壶彩绘大套装", qty: 1, price: 2400 }, { name: "石瓢壶刻绘单壶", qty: 1, price: 2020 }], total: 4420, status: "delivered", date: "2026-06-03", trackingNumber: "SF1234567893" },
  { id: "ORD-20260608", customer: "林小花", email: "lin@example.com", phone: "+886 912***789", address: "台北市大安區忠孝東路四段100號", items: [{ name: "百年利永仿古壶梦款", qty: 1, price: 8300 }], total: 8300, status: "pending", date: "2026-06-01" },
  { id: "ORD-20260609", customer: "黄蓉", email: "huang@example.com", phone: "+86 133****8888", address: "成都市锦江区红星路三段1号", items: [{ name: "颐壶春汉瓦壶100目", qty: 1, price: 2620 }], total: 2620, status: "paid", date: "2026-05-28" },
];

var statusLabel: Record<string, string> = { pending: "待付款", paid: "已付款", shipped: "已发货", delivered: "已送达", cancelled: "已取消" };

function filterOrders(orders: any[], period: string) {
  var now = new Date();
  if (period === "today") { var today = now.toISOString().slice(0, 10); return orders.filter(function(o) { return o.date === today; }); }
  if (period === "week") { var weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10); return orders.filter(function(o) { return o.date >= weekAgo; }); }
  if (period === "month") { var monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10); return orders.filter(function(o) { return o.date >= monthAgo; }); }
  return orders;
}

var periods = [
  { key: "today", label: "今日" },
  { key: "week", label: "近7天" },
  { key: "month", label: "近30天" },
  { key: "all", label: "全部" },
];

export default function OrdersPage() {
  var router = useRouter();
  var _useState = useState<any>(null), user = _useState[0], setUser = _useState[1];
  var _useState2 = useState(true), loading = _useState2[0], setLoading = _useState2[1];
  var _useState3 = useState("month"), period = _useState3[0], setPeriod = _useState3[1];

  useEffect(function() {
    var u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    setLoading(false);
  }, [router]);

  if (loading) return React.createElement("div", { className: "flex items-center justify-center min-h-\[60vh\]" }, React.createElement("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }));

  var filteredOrders = filterOrders(MOCK_ORDERS, period);

  return React.createElement("div", { className: "mx-auto max-w-4xl px-4 py-8 sm:px-6" },
    React.createElement("h1", { className: "text-2xl font-bold text-foreground mb-2" }, "我的订单"),
    user?.role === "admin" ? React.createElement("div", { className: "mb-4" },
      React.createElement(Link, { href: "/admin/orders" }, React.createElement("span", { className: "text-xs text-primary hover:underline" }, "管理所有订单"))
    ) : null,
    React.createElement("div", { className: "flex gap-2 mb-6 overflow-x-auto" },
      periods.map(function(p: any) {
        return React.createElement("button", {
          key: p.key,
          onClick: function() { setPeriod(p.key); },
          className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " + (period === p.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")
        }, p.label);
      })
    ),
    filteredOrders.length === 0 ? React.createElement("div", { className: "text-center py-20 text-muted-foreground" },
      React.createElement("p", { className: "text-lg mb-4" }, "暂无订单"),
      React.createElement(Link, { href: "/products", className: "inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90" }, "去购物")
    ) : React.createElement("div", { className: "space-y-4" },
      filteredOrders.map(function(o) {
        return React.createElement("div", { key: o.id, className: "rounded-lg border border-border bg-card p-4" },
          React.createElement("div", { className: "flex items-center justify-between mb-3" },
            React.createElement("div", null,
              React.createElement("p", { className: "text-sm font-medium text-foreground" }, "订单 #" + o.id),
              React.createElement("p", { className: "text-xs text-muted-foreground" }, o.date)
            ),
            React.createElement("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full " + (o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : o.status === "paid" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700") }, statusLabel[o.status] || o.status)
          ),
          React.createElement("div", { className: "divide-y divide-border" },
            o.items.map(function(item: any) {
              return React.createElement("div", { key: item.name, className: "py-2 flex justify-between text-sm" },
                React.createElement("span", { className: "text-foreground" }, item.name + " x" + item.qty),
                React.createElement("span", { className: "font-medium" }, "¥" + Number(item.price).toFixed(2))
              );
            })
          ),
          React.createElement("div", { className: "mt-3 pt-3 border-t border-border flex justify-between items-center" },
            React.createElement("span", { className: "text-sm font-bold text-foreground" }, "合计: ¥" + Number(o.total).toFixed(2)),
            React.createElement("div", { className: "flex gap-2" },
              React.createElement(Link, { href: "/orders/" + o.id, className: "text-xs text-primary hover:underline" }, "查看详情"),
              o.trackingNumber ? React.createElement("a", { href: "https://www.kuaidi100.com/all/" + o.trackingNumber, target: "_blank", className: "text-xs text-primary hover:underline" }, "物流: " + o.trackingNumber) : null
            )
          )
        );
      })
    )
  );
}