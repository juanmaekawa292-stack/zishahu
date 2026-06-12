 "use client";

 import { useTranslations } from "next-intl";
 import { useState } from "react";
 import {
   MessageSquare,
   Search,
   Clock,
   CheckCircle2,
   XCircle,
   AlertCircle,
   Filter,
   RefreshCw,
   ChevronDown,
   ChevronUp,
 } from "lucide-react";
 import { cn } from "@/lib/utils";

 // Mock ticket data
 const initialTickets = [
   {
     id: "TKT-001",
     customer: "王小明",
     email: "wang@example.com",
     subject: "order",
     message: "我的订单 ORD-001 已经支付成功，请问什么时候发货？",
     priority: "normal",
     status: "pending",
     createdAt: "2026-06-12 10:30",
   },
   {
     id: "TKT-002",
     customer: "李芳",
     email: "li@example.com",
     subject: "shipping",
     message: "包裹已经 10 天了还没到，物流信息一直没有更新，请帮忙查询。",
     priority: "high",
     status: "in_progress",
     createdAt: "2026-06-11 14:20",
   },
   {
     id: "TKT-003",
     customer: "陈伟",
     email: "chen@example.com",
     subject: "return",
     message: "收到紫砂壶有裂纹，想申请退换货，附件是照片。",
     priority: "urgent",
     status: "pending",
     createdAt: "2026-06-12 09:15",
   },
   {
     id: "TKT-004",
     customer: "张丽华",
     email: "zhang@example.com",
     subject: "product",
     message: "请问石瓢壶适合泡普洱茶吗？段泥和紫泥有什么区别？",
     priority: "low",
     status: "resolved",
     createdAt: "2026-06-10 16:45",
   },
 ];

 const ticketSubjects: Record<string, string> = {
   order: "订单问题",
   shipping: "物流问题",
   return: "退换货",
   product: "产品咨询",
   other: "其他",
 };

 const priorityLabels: Record<string, string> = {
   low: "低",
   normal: "中",
   high: "高",
   urgent: "紧急",
 };

 const priorityColors: Record<string, string> = {
   low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
   normal: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
   high: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
   urgent: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
 };

 const statusLabels: Record<string, string> = {
   pending: "待处理",
   in_progress: "处理中",
   resolved: "已解决",
   closed: "已关闭",
 };

 const statusColors: Record<string, string> = {
   pending: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
   in_progress: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
   resolved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
   closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
 };

 export default function AdminServicePage() {
   const t = useTranslations("service");
   const [tickets, setTickets] = useState(initialTickets);
   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState<string>("all");
   const [expandedId, setExpandedId] = useState<string | null>(null);
   const [newTicketOpen, setNewTicketOpen] = useState(false);

   const filtered = tickets.filter((t) => {
     const matchSearch =
       t.customer.toLowerCase().includes(search.toLowerCase()) ||
       t.id.toLowerCase().includes(search.toLowerCase()) ||
       t.email.toLowerCase().includes(search.toLowerCase());
     const matchStatus = statusFilter === "all" || t.status === statusFilter;
     return matchSearch && matchStatus;
   });

   const updateStatus = (id: string, newStatus: string) => {
     setTickets((prev) =>
       prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
     );
   };

   const statusCounts = {
     all: tickets.length,
     pending: tickets.filter((t) => t.status === "pending").length,
     in_progress: tickets.filter((t) => t.status === "in_progress").length,
     resolved: tickets.filter((t) => t.status === "resolved").length,
   };

   return (
     <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
       {/* Header */}
       <div className="mb-6 flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold text-foreground">{t("adminService")}</h1>
           <p className="text-sm text-muted-foreground">{t("adminServiceDesc")}</p>
         </div>
         <button
           onClick={() => setTickets([...initialTickets])}
           className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
         >
           <RefreshCw className="h-3.5 w-3.5" />
           刷新
         </button>
       </div>

       {/* Status counts */}
       <div className="mb-6 grid grid-cols-4 gap-3">
         {Object.entries(statusCounts).map(([key, count]) => (
           <button
             key={key}
             onClick={() => setStatusFilter(key)}
             className={cn(
               "rounded-lg border border-border bg-card p-3 text-center transition-colors hover:border-primary/30",
               statusFilter === key && "border-primary/50 bg-primary/5"
             )}
           >
             <p className="text-lg font-bold text-foreground">{count}</p>
             <p className="text-[10px] text-muted-foreground">
               {key === "all" ? "全部" : statusLabels[key as keyof typeof statusLabels]}
             </p>
           </button>
         ))}
       </div>

       {/* Search */}
       <div className="mb-4 relative">
         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
         <input
           type="text"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="搜索客户姓名、邮箱或工单号..."
           className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
         />
       </div>

       {/* Ticket List */}
       <div className="rounded-lg border border-border bg-card">
         {filtered.length === 0 ? (
           <div className="py-12 text-center">
             <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
             <p className="mt-3 text-sm text-muted-foreground">暂无工单</p>
           </div>
         ) : (
           <div className="divide-y divide-border">
             {filtered.map((ticket) => (
               <div key={ticket.id}>
                 <button
                   onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                   className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-muted/50 transition-colors"
                 >
                   <div className="flex items-center gap-3 min-w-0">
                     <span className={cn(
                       "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                       priorityColors[ticket.priority]
                     )}>
                       {ticket.subject === "urgent" ? "!" : ticket.id.slice(-3)}
                     </span>
                     <div className="min-w-0">
                       <p className="text-sm font-medium text-foreground truncate">
                         {ticket.customer} - {ticketSubjects[ticket.subject] || ticket.subject}
                       </p>
                       <p className="text-xs text-muted-foreground truncate">{ticket.message.slice(0, 60)}...</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 shrink-0">
                     <span className={cn(
                       "rounded-full px-2 py-0.5 text-[10px] font-medium",
                       priorityColors[ticket.priority]
                     )}>
                       {priorityLabels[ticket.priority]}
                     </span>
                     <span className={cn(
                       "rounded-full px-2 py-0.5 text-[10px] font-medium",
                       statusColors[ticket.status]
                     )}>
                       {statusLabels[ticket.status]}
                     </span>
                     <span className="text-[10px] text-muted-foreground">{ticket.createdAt}</span>
                     {expandedId === ticket.id ? (
                       <ChevronUp className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                 </button>
                 {expandedId === ticket.id && (
                   <div className="border-t border-border bg-muted/30 px-5 py-4">
                     <div className="mb-3">
                       <p className="mb-2 text-sm text-foreground leading-relaxed">{ticket.message}</p>
                       <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                         <span>工单号: {ticket.id}</span>
                         <span>邮箱: {ticket.email}</span>
                         <span>提交时间: {ticket.createdAt}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       {ticket.status === "pending" && (
                         <button
                           onClick={() => updateStatus(ticket.id, "in_progress")}
                           className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                         >
                           <Clock className="h-3 w-3" />
                           开始处理
                         </button>
                       )}
                       {ticket.status === "in_progress" && (
                         <button
                           onClick={() => updateStatus(ticket.id, "resolved")}
                           className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                         >
                           <CheckCircle2 className="h-3 w-3" />
                           标记解决
                         </button>
                       )}
                       {ticket.status !== "closed" && ticket.status !== "pending" && (
                         <button
                           onClick={() => updateStatus(ticket.id, "closed")}
                           className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                         >
                           <XCircle className="h-3 w-3" />
                           关闭
                         </button>
                       )}
                       {ticket.status === "pending" && (
                         <button
                           onClick={() => updateStatus(ticket.id, "resolved")}
                           className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                         >
                           <CheckCircle2 className="h-3 w-3" />
                           直接解决
                         </button>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   );
 }
