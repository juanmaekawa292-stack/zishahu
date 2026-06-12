 "use client";

 import { useTranslations } from "next-intl";
 import { useState } from "react";
 import { Link } from "@/i18n";
 import {
   Search,
   ChevronDown,
   ChevronUp,
   Package,
   DollarSign,
   RefreshCw,
   Flower2,
   CreditCard,
   HelpCircle,
   Mail,
   Clock,
 } from "lucide-react";
 import { cn } from "@/lib/utils";

 const faqCategories = [
   { key: "shipping", icon: Package, labelKey: "shippingInfo" },
   { key: "tariffs", icon: DollarSign, labelKey: "paymentInfo" },
   { key: "returns", icon: RefreshCw, labelKey: "returnsExchanges" },
   { key: "care", icon: Flower2, labelKey: "careGuide" },
   { key: "payment", icon: CreditCard, labelKey: "paymentInfo" },
 ];

 const faqData: Record<string, { q: string; a: string }[]> = {
   shipping: [
     { q: "下单后多久发货？", a: "正常情况下，我们会在收到订单后的 1-3 个工作日内从宜兴发货。定制/手工订单可能需要 5-7 个工作日。" },
     { q: "支持哪些国际物流方式？", a: "国际小包（10-15 个工作日，可追踪）、国际专线（7-10 个工作日，可追踪，含保险）、DHL 快递（3-5 个工作日，可追踪，含保险）。" },
     { q: "如何查询物流信息？", a: "发货后您会收到包含物流单号的邮件通知。您可以在订单页面或物流公司官网追踪包裹。" },
     { q: "发往哪些国家和地区？", a: "我们发往全球主要国家和地区，包括美国、加拿大、英国、澳大利亚、欧盟各国、日本、韩国、新加坡、马来西亚、台湾、香港等。" },
     { q: "包裹被海关扣留怎么办？", a: "请第一时间联系客服，我们会配合提供清关所需文件（发票、产地证明等）。" },
   ],
   tariffs: [
     { q: "到我的国家需要交关税吗？", a: "关税政策因国家和商品价值而异。美国 $800 以下、欧盟 €22 以下、英国 £15 以下、澳大利亚 $1000 AUD 以下通常免关税。新加坡和香港大部分商品免税。" },
     { q: "关税由谁承担？", a: "买家承担目的地国家的关税和税费。我们会提供准确的商品价值和海关编码协助清关。" },
   ],
   returns: [
     { q: "退换货期限是多久？", a: "自签收之日起 30 天内可申请退换货。" },
     { q: "哪些情况可以退换货？", a: "运输损坏、产品瑕疵、与描述不符可免费退换；无理由退换（未使用、不影响二次销售）买家承担退回运费。" },
     { q: "退款需要多久到账？", a: "PayPal 3-5 个工作日，Stripe 信用卡 5-10 个工作日。" },
   ],
   care: [
     { q: "新壶需要开壶吗？怎么开壶？", a: "需要。清水冲洗 → 软布擦拭 → 纯净水小火煮沸 30 分钟（可放茶叶同煮）→ 自然冷却冲净即可。" },
     { q: "一壶可以泡多种茶吗？", a: "不建议。紫砂壶有吸附性，建议一壶一茶，这样茶香会更加醇厚。" },
     { q: "如何保养紫砂壶？", a: "使用后及时清洗倒扣晾干，不要用洗洁精或化学清洁剂，用软布擦拭，存放时保持通风干燥。" },
     { q: "如何辨别紫砂壶真假？", a: "听声音（真紫砂清脆悦耳）、看气孔（真紫砂有微小气孔）、看颜色（自然温润）、泡水测试（透气性好）。" },
   ],
   payment: [
     { q: "支持哪些支付方式？", a: "我们支持 Stripe 信用卡/借记卡 和 PayPal。" },
     { q: "下单后多久可以取消订单？", a: "订单在未发货状态下可以取消。已发货的订单如需取消请走退货流程。" },
     { q: "如何查看订单状态？", a: "登录后在「我的订单」页面查看，或使用订单号查询。" },
   ],
 };

 export default function FAQPage() {
   const t = useTranslations("service");
   const [search, setSearch] = useState("");
   const [activeCategory, setActiveCategory] = useState<string>("shipping");
   const [openItems, setOpenItems] = useState<Set<string>>(new Set());

   const toggleItem = (key: string) => {
     const next = new Set(openItems);
     next.has(key) ? next.delete(key) : next.add(key);
     setOpenItems(next);
   };

   const filteredFaqs = Object.entries(faqData).reduce((acc, [cat, items]) => {
     const filtered = items.filter(
       (item) =>
         item.q.toLowerCase().includes(search.toLowerCase()) ||
         item.a.toLowerCase().includes(search.toLowerCase())
     );
     if (filtered.length > 0) acc[cat] = filtered;
     return acc;
   }, {} as Record<string, { q: string; a: string }[]>);

   const currentFaqs = search
     ? Object.values(filteredFaqs).flat()
     : faqData[activeCategory] || [];

   return (
     <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
       {/* Header */}
       <div className="mb-8 text-center">
         <h1 className="text-3xl font-bold text-foreground">{t("faq")}</h1>
         <p className="mt-2 text-sm text-muted-foreground">{t("faqSubtitle")}</p>
       </div>

       {/* Search */}
       <div className="relative mx-auto mb-8 max-w-md">
         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
         <input
           type="text"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder={t("faqSearchPlaceholder")}
           className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
         />
       </div>

       {/* Category Tabs */}
       {!search && (
         <div className="mb-8 flex flex-wrap justify-center gap-2">
           {faqCategories.map((cat) => {
             const Icon = cat.icon;
             return (
               <button
                 key={cat.key}
                 onClick={() => setActiveCategory(cat.key)}
                 className={cn(
                   "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                   activeCategory === cat.key
                     ? "bg-primary text-primary-foreground"
                     : "bg-muted text-muted-foreground hover:bg-muted/80"
                 )}
               >
                 <Icon className="h-4 w-4" />
                 {t(cat.labelKey)}
               </button>
             );
           })}
         </div>
       )}

       {/* FAQ Items */}
       <div className="space-y-2">
         {currentFaqs.length === 0 ? (
           <div className="py-12 text-center">
             <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
             <p className="mt-3 text-sm text-muted-foreground">未找到相关问题</p>
             <Link
               href="/help"
               className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
             >
               {t("contactUs")} →
             </Link>
           </div>
         ) : (
           currentFaqs.map((faq, idx) => {
             const key = `${activeCategory}-${idx}`;
             const isOpen = openItems.has(key);
             return (
               <div
                 key={key}
                 className="rounded-lg border border-border bg-card transition-colors hover:border-primary/20"
               >
                 <button
                   onClick={() => toggleItem(key)}
                   className="flex w-full items-center justify-between px-5 py-4 text-left"
                 >
                   <span className="text-sm font-medium text-foreground">{faq.q}</span>
                   {isOpen ? (
                     <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                   ) : (
                     <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                   )}
                 </button>
                 {isOpen && (
                   <div className="border-t border-border px-5 py-4">
                     <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                   </div>
                 )}
               </div>
             );
           })
         )}
       </div>

       {/* Still need help */}
       <div className="mt-12 rounded-lg border border-border bg-card p-6 text-center">
         <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" />
         <h3 className="mt-3 text-sm font-medium text-foreground">还有问题？</h3>
         <p className="mt-1 text-xs text-muted-foreground">
           我们的客服团队随时为您提供帮助
         </p>
         <div className="mt-4 flex items-center justify-center gap-4">
           <Link
             href="/help"
             className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
           >
             <Mail className="h-3.5 w-3.5" />
             {t("contactUs")}
           </Link>
           <span className="flex items-center gap-1 text-xs text-muted-foreground">
             <Clock className="h-3.5 w-3.5" />
             24 小时内回复
           </span>
         </div>
       </div>
     </div>
   );
 }
