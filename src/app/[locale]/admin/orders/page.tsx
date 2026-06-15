"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";

import { useTranslations } from "next-intl";
import { Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n";
import { ArrowUpRight } from "lucide-react";

const mockOrders = [
  { id: "ORD-001", customer: "王小明", email: "wang@example.com", phone: "+86 139****1234", items: 2, total: 1990, cost: 120, profit: 1870, status: "pending", createdAt: "2026-06-15 09:30", sourceMap: {} },
  { id: "ORD-002", customer: "李芳", email: "li@example.com", phone: "+86 138****5678", items: 1, total: 2620, cost: 180, profit: 2440, status: "paid", createdAt: "2026-06-14 14:20", sourceMap: {} },
  { id: "ORD-003", customer: "陈伟", email: "chen@example.com", phone: "+1 415***8901", items: 2, total: 7670, cost: 440, profit: 7230, status: "paid", createdAt: "2026-06-13 10:15", sourceMap: {} },
  { id: "ORD-004", customer: "赵丽", email: "zhao@example.com", phone: "+86 186****2345", items: 2, total: 1740, cost: 95, profit: 1645, status: "shipped", createdAt: "2026-06-12 16:45", sourceMap: {}, trackingNumber: "SF1234567890" },
  { id: "ORD-005", customer: "刘洋", email: "liu@example.com", phone: "+86 137****6789", items: 2, total: 4770, cost: 310, profit: 4460, status: "shipped", createdAt: "2026-06-11 11:30", sourceMap: {}, trackingNumber: "SF1234567891" },
  { id: "ORD-006", customer: "张敏", email: "zhangm@example.com", phone: "+65 9***1234", items: 1, total: 2600, cost: 160, profit: 2440, status: "delivered", createdAt: "2026-06-10 09:00", sourceMap: {}, trackingNumber: "SF1234567892" },
  { id: "ORD-007", customer: "黄蓉", email: "huang@example.com", phone: "+86 133****8888", items: 1, total: 2620, cost: 180, profit: 2440, status: "delivered", createdAt: "2026-06-08 14:10", sourceMap: {}, trackingNumber: "SF1234567893" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "success" }> = {
  pending: { label: "待付款", variant: "warning" },
  paid: { label: "已付款", variant: "default" },
  shipped: { label: "已发货", variant: "default" },
  delivered: { label: "已送达", variant: "success" },
  cancelled: { label: "已取消", variant: "secondary" },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); }
    else { setAuthorized(true); }
  }, [router]);

  
  const [statusFilter, setStatusFilter] = useState("all");
  const [shipModal, setShipModal] = useState(null);

  const filteredOrders = statusFilter === "all" ? mockOrders : mockOrders.filter(function(o) { return o.status === statusFilter; });

  const handleShip = function(id: string) {
    var tn = window.prompt("请输入物流单号:");
    if (tn !== null && tn.trim() !== "") {
      var trackNum = tn.trim();
      mockOrders.forEach(function(o) { if (o.id === id) { o.trackingNumber = trackNum; o.status = "shipped"; } });
      setStatusFilter(statusFilter);
    }
  };
if (!authorized) return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  const t = useTranslations("admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("orders")}</h1>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[{ key: "all", label: "全部" }, { key: "pending", label: "待付款" }, { key: "paid", label: "待发货" }, { key: "shipped", label: "已发货" }, { key: "delivered", label: "已完成" }].map(function(f) {
              return <button key={f.key} onClick={function() { setStatusFilter(f.key); }} className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " + (statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{f.label}</button>;
            })}
          </div><table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">订单号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">客户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">商品数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">来源</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockOrders.map((order) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.createdAt}</td>
                  <td className="px-4 py-3 text-xs">{order.items}</td>
                  <td className="px-4 py-3 text-sm font-medium">{"¥" + Number(order.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {order.sourceMap && Object.keys(order.sourceMap).length > 0 ? (
                      <span className="text-blue-500 text-[10px]">已溯源 {Object.keys(order.sourceMap).length} 项</span>
                   ) : (
                     <span className="text-muted-foreground text-[10px]">-</span>
                   )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.createdAt}</td>
                  <td className="px-4 py-3"><Badge variant={status.variant} className="text-[10px]">{status.label}</Badge></td>
                  <td className="px-4 py-3">
                    {order.status === "paid" && (
                      <button onClick={function() { handleShip(order.id); }} className="text-xs text-primary hover:underline font-medium">手动发货</button>
                    )}
                    {order.trackingNumber && (
                      <a href={"https://www.kuaidi100.com/all/" + order.trackingNumber} target="_blank" className="text-xs text-primary hover:underline font-medium">{order.trackingNumber}</a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={"/orders/" + order.id}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ExternalLink className="h-4 w-4" /></Button>
                  </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}
