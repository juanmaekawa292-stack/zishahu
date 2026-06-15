"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Link } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const MOCK_ORDERS = [
  { id: "ORD-20260601", customer: "王晓星", email: "wang@example.com", phone: "+86 139****1234",
    address: "北京市朝阳区建国路88号", items: [{ name: "古悦堂归兽壶套装", qty: 1, sku: "5090328630316", sourceUrl: "https://detail.tmall.com/item.htm?id=5090328630316", cost: 120, price: 1990 }],
    total: 1990, cost: 120, profit: 1870, status: "delivered", date: "2026-06-15" },
  { id: "ORD-20260602", customer: "李芳", email: "li@example.com", phone: "+86 138****5678",
    address: "上海市浦东新区陆家嘴环路1000号", items: [{ name: "颐壶春汉瓦壶", qty: 1, sku: "5870199246605", sourceUrl: "https://detail.tmall.com/item.htm?id=5870199246605", cost: 180, price: 2620 }],
    total: 262, cost: 180, profit: 82, status: "delivered", date: "2026-06-14" },
  { id: "ORD-20260603", customer: "陈伟", email: "chen@example.com", phone: "+1 415***8901",
    address: "123 Main St, San Francisco, CA 94102 USA", items: [{ name: "戴晨光西施壶220ml", qty: 1, sku: "4892704991279", sourceUrl: "https://detail.tmall.com/item.htm?id=4892704991279", cost: 320, price: 5650 }, { name: "石瓢壶彩绘款单壶", qty: 1, sku: "4917490400252", sourceUrl: "https://detail.tmall.com/item.htm?id=4917490400252", cost: 120, price: 2020 }],
    total: 7670, cost: 440, profit: 7230, status: "shipped", date: "2026-06-12" },
  { id: "ORD-20260604", customer: "赵丽", email: "zhao@example.com", phone: "+86 186****2345",
    address: "广州市天河区体育西路100号", items: [{ name: "大容量430ml西施壶描金", qty: 1, sku: "5468999596941", sourceUrl: "https://detail.tmall.com/item.htm?id=5468999596941", cost: 45, price: 830 }, { name: "祥龙仿古壶礼盒装", qty: 1, sku: "5852617647184", sourceUrl: "https://detail.tmall.com/item.htm?id=5852617647184", cost: 50, price: 910 }],
    total: 1740, cost: 95, profit: 1645, status: "paid", date: "2026-06-10" },
  { id: "ORD-20260605", customer: "刘洋", email: "liu@example.com", phone: "+86 137****6789",
    address: "深圳市南山区科技园南路1号", items: [{ name: "2026新款仿古壶350cc", qty: 1, sku: "6218664239079", sourceUrl: "https://detail.tmall.com/item.htm?id=6218664239079", cost: 150, price: 2460 }],
    total: 2460, cost: 150, profit: 2310, status: "pending", date: "2026-06-08" },
  { id: "ORD-20260606", customer: "王大明", email: "wangdm@example.com", phone: "+86 159****4567",
    address: "杭州市西湖区文三路200号", items: [{ name: "古悦堂名家如意西施壶", qty: 1, sku: "4922128389856", sourceUrl: "https://detail.tmall.com/item.htm?id=4922128389856", cost: 160, price: 2600 }],
    total: 2600, cost: 160, profit: 2440, status: "shipped", date: "2026-06-05" },
  { id: "ORD-20260607", customer: "张敏", email: "zhangm@example.com", phone: "+65 9***1234",
    address: "1 Raffles Place, Singapore 048616", items: [{ name: "石瓢壶彩绘大套装", qty: 1, sku: "4917490400255", sourceUrl: "https://detail.tmall.com/item.htm?id=4917490400255", cost: 140, price: 2400 }, { name: "石瓢壶刻绘单壶", qty: 1, sku: "4917490400253", sourceUrl: "https://detail.tmall.com/item.htm?id=4917490400253", cost: 120, price: 202 }],
    total: 4420, cost: 260, profit: 4160, status: "delivered", date: "2026-06-03" },
  { id: "ORD-20260608", customer: "林小花", email: "lin@example.com", phone: "+886 912***789",
    address: "台北市大安區忠孝東路四段100號", items: [{ name: "百年利永仿古壶梦款", qty: 1, sku: "6218713099208", sourceUrl: "https://detail.tmall.com/item.htm?id=6218713099208", cost: 500, price: 8300 }],
    total: 8300, cost: 500, profit: 7800, status: "pending", date: "2026-06-01" },
  { id: "ORD-20260609", customer: "黄蓉", email: "huang@example.com", phone: "+86 133****8888",
    address: "成都市锦江区红星路三段1号", items: [{ name: "颐壶春汉瓦壶100目", qty: 1, sku: "5870199246605", sourceUrl: "https://detail.tmall.com/item.htm?id=5870199246605", cost: 180, price: 262 }],
    total: 2620, cost: 180, profit: 2440, status: "paid", date: "2026-05-28" },
];

var statusMap: Record<string, string> = {
  pending: "pending", paid: "default", shipped: "default", delivered: "success", cancelled: "secondary"
};

function filterOrders(orders: any[], period: string) {
  var now = new Date();
  if (period === "today") {
    var today = now.toISOString().slice(0, 10);
    return orders.filter(function(o) { return o.date === today; });
  }
  if (period === "week") {
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return orders.filter(function(o) { return o.date >= weekAgo; });
  }
  if (period === "month") {
    var monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return orders.filter(function(o) { return o.date >= monthAgo; });
  }
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
  var [user, setUser] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [period, setPeriod] = useState("month");

  useEffect(function() {
    var u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="flex items-center justify-center min-h-\[60vh\]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  var filteredOrders = filterOrders(MOCK_ORDERS, period);
  var totalProfit = filteredOrders.reduce(function(s: number, o: any) { return s + o.profit; }, 0);
  var totalRevenue = filteredOrders.reduce(function(s: number, o: any) { return s + o.total; }, 0);
  var totalCost = filteredOrders.reduce(function(s: number, o: any) { return s + o.cost; }, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">订单管理</h1>

      {user?.role === "admin" && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-card flex items-center justify-between">
          <p className="text-sm text-muted-foreground">管理员选项</p>
          <Link href="/admin/orders"><Button variant="outline" size="sm">后台订单管理</Button></Link>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {periods.map(function(p) {
          return <button key={p.key} onClick={function() { setPeriod(p.key); }} className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " + (period === p.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{p.label}</button>;
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">营收</p>
          <p className="text-xl font-bold text-foreground mt-1">{"¥" + totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">成本 (采购价)</p>
          <p className="text-xl font-bold text-foreground mt-1">{"¥" + totalCost.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">利润</p>
          <p className="text-xl font-bold text-green-600 mt-1">¥{totalProfit.toFixed(2)}</p>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-4">暂无订单</p>
          <Link href="/products"><Button variant="default">去购物</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(function(o: any) {
            return <div key={o.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">订单 #{o.id}</p>
                  <p className="text-xs text-muted-foreground">{o.date} | {o.customer}</p>
                </div>
                <span className={"text-xs rounded-full px-2 py-0.5 font-medium " + (o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : o.status === "paid" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700")}>{o.status === "pending" ? "待付款" : o.status === "paid" ? "已付款" : o.status === "shipped" ? "已发货" : o.status === "delivered" ? "已送达" : "已取消"}</span>
              </div>
              <div className="divide-y divide-border">
                {o.items.map(function(item: any) {
                  return <div key={item.sku} className="py-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground">{item.name} x{item.qty}</span>
                      <span className="font-medium">{"¥" + Number(item.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>采购价: ¥{item.cost} | 利润: ¥{item.price - item.cost}</span>
                      <a href={item.sourceUrl} target="_blank" className="text-primary hover:underline">淘宝原链接 #{item.sku}</a>
                    </div>
                  </div>;
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-sm">
                <span className="text-muted-foreground">客户: {o.customer} | {o.email} | {o.phone}</span>
                <div className="text-right">
                  <p className="text-muted-foreground">成本: ¥{o.cost}</p>
                  <p className="text-foreground font-medium">售价: {"¥" + Number(o.total).toFixed(2)}</p>
                  <p className="text-green-600 font-bold">利润: ¥{o.profit}</p>
                </div>
              </div>
            </div>;
          })}
        </div>
      )}
    </div>
  );
}