"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Mail, Globe, ShoppingCart, MoreHorizontal, ChevronDown, ArrowUpDown } from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { cn } from "@/lib/utils";

var mockCustomers = [
  { name: "Michael Wang", email: "mwang@gmail.com", country: "US", orders: 3, spent: 427.90, lastOrder: "2026-06-20", status: "active", chatTool: "whatsapp", chatId: "+1 415 555 1234" },
  { name: "Sarah Li", email: "sli@outlook.com", country: "CA", orders: 2, spent: 178.50, lastOrder: "2026-06-19", status: "active", chatTool: "telegram", chatId: "@sarah_li" },
  { name: "James Chen", email: "jchen@gmail.com", country: "US", orders: 5, spent: 890.00, lastOrder: "2026-06-18", status: "active", chatTool: "wechat", chatId: "james_chen88" },
  { name: "Emily Zhao", email: "ezhao@yahoo.com", country: "AU", orders: 1, spent: 120.00, lastOrder: "2026-06-16", status: "active" },
  { name: "David Liu", email: "dliu@gmail.com", country: "US", orders: 4, spent: 652.00, lastOrder: "2026-06-14", status: "active", chatTool: "messenger", chatId: "david.liu.92" },
  { name: "Grace Huang", email: "ghuang@icloud.com", country: "GB", orders: 2, spent: 220.00, lastOrder: "2026-06-08", status: "active", chatTool: "signal", chatId: "grace_h.01" },
  { name: "Tom Tanaka", email: "ttanaka@yahoo.co.jp", country: "JP", orders: 1, spent: 95.00, lastOrder: "2026-06-05", status: "inactive" },
  { name: "Anna Schmidt", email: "anna.s@web.de", country: "DE", orders: 2, spent: 310.00, lastOrder: "2026-05-28", status: "active", chatTool: "whatsapp", chatId: "+49 170 555 6789" },
];

var flagEmoji: Record<string, string> = { US: "🇺🇸", CA: "🇨🇦", GB: "🇬🇧", AU: "🇦🇺", JP: "🇯🇵", DE: "🇩🇪", FR: "🇫🇷", SG: "🇸🇬", KR: "🇰🇷", TW: "🇹🇼" };
var countryNames: Record<string, string> = { US: "美国", CA: "加拿大", GB: "英国", AU: "澳大利亚", JP: "日本", DE: "德国", FR: "法国", SG: "新加坡", KR: "韩国", TW: "台湾" };

var chatIcons: Record<string, string> = { whatsapp: "💬", telegram: "✈️", wechat: "💚", messenger: "🔵", signal: "🟢", line: "🟣" };

export default function AdminCustomersPage() {
  var router = useRouter();
  var [authorized, setAuthorized] = useState(false);

  useEffect(function() {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") router.push("/login");
    else setAuthorized(true);
  }, [router]);
  var [search, setSearch] = useState("");
  var [sortBy, setSortBy] = useState("spent");

  var filtered = mockCustomers.filter(function(c) {
    return !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
  });

  filtered.sort(function(a, b) { return b.spent - a.spent; });

  var totalCustomers = filtered.length;
  var activeCustomers = 0;
  var totalRevenue = 0;

  if (!authorized) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">客户管理</h1>
        <p className="text-sm text-muted-foreground mt-1">共 {totalCustomers} 位客户，{activeCustomers} 位活跃</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-2xl font-bold text-foreground">{totalCustomers}</p><p className="text-xs text-muted-foreground">总客户数</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-2xl font-bold text-foreground">{activeCustomers}</p><p className="text-xs text-muted-foreground">活跃客户</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(0)}</p><p className="text-xs text-muted-foreground">总消费额</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={function(e) { setSearch(e.target.value); }}
              placeholder="搜索客户姓名或邮箱..."
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              {["客户", "邮箱", "地区", "订单数", "消费额", "联系方式", "最后下单"].map(function(h) {
                return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(function(c) {
              return (
                <tr key={c.email} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><span className="text-sm font-medium text-foreground">{c.name}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-xs">{flagEmoji[c.country] || "🌐"} {countryNames[c.country] || c.country}</td>
                  <td className="px-4 py-3 text-sm">{c.orders}</td>
                  <td className="px-4 py-3 text-sm font-medium">${c.spent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.chatTool ? <span>{chatIcons[c.chatTool] || "📧"} {c.chatId || c.email}</span> : <span className="text-muted-foreground">{c.email}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastOrder}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}