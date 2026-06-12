 "use client";

 import { useTranslations } from "next-intl";
 import { useState } from "react";
 import { Link } from "@/i18n";
 import {
   Mail,
   MessageSquare,
   Clock,
   CheckCircle2,
   HelpCircle,
   Package,
   RefreshCw,
   Truck,
   ChevronRight,
 } from "lucide-react";
 import { cn } from "@/lib/utils";

 const quickHelpItems = [
   { icon: Package, href: "/faq?cat=shipping", label: "发货与物流" },
   { icon: RefreshCw, href: "/faq?cat=returns", label: "退换货政策" },
   { icon: Truck, href: "/orders", label: "订单追踪" },
   { icon: HelpCircle, href: "/faq", label: "常见问题" },
 ];

 export default function HelpPage() {
   const t = useTranslations("service");
   const [formData, setFormData] = useState({
     name: "",
     email: "",
     orderId: "",
     subject: "",
     message: "",
   });
   const [submitted, setSubmitted] = useState(false);

   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     // TODO: wire up to real API
     console.log("Contact form:", formData);
     setSubmitted(true);
   };

   return (
     <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
       {/* Header */}
       <div className="mb-8 text-center">
         <h1 className="text-3xl font-bold text-foreground">{t("helpCenter")}</h1>
         <p className="mt-2 text-sm text-muted-foreground">{t("helpSubtitle")}</p>
       </div>

       <div className="grid gap-8 lg:grid-cols-3">
         {/* Left - Quick Help */}
         <div className="lg:col-span-1">
           <div className="rounded-lg border border-border bg-card p-5">
             <h2 className="mb-4 text-sm font-medium text-foreground">{t("quickHelp")}</h2>
             <p className="mb-4 text-xs text-muted-foreground">{t("quickHelpDesc")}</p>
             <div className="space-y-2">
               {quickHelpItems.map((item) => {
                 const Icon = item.icon;
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     className="flex items-center gap-3 rounded-md p-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                   >
                     <Icon className="h-4 w-4 shrink-0 text-primary" />
                     <span className="flex-1">{item.label}</span>
                     <ChevronRight className="h-3.5 w-3.5" />
                   </Link>
                 );
               })}
             </div>
           </div>

           {/* Contact Info */}
           <div className="mt-4 rounded-lg border border-border bg-card p-5">
             <h2 className="mb-4 text-sm font-medium text-foreground">{t("contactInfoTitle")}</h2>
             <div className="space-y-3">
               <div className="flex items-start gap-3">
                 <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                 <div>
                   <p className="text-xs font-medium text-foreground">{t("emailUs")}</p>
                   <p className="text-xs text-muted-foreground">{t("contactInfoEmail")}</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                 <div>
                   <p className="text-xs font-medium text-foreground">工作时间</p>
                   <p className="text-xs text-muted-foreground">{t("contactInfoHours")}</p>
                   <p className="text-xs text-muted-foreground">{t("contactInfoResponse")}</p>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Right - Contact Form */}
         <div className="lg:col-span-2">
           {submitted ? (
             <div className="rounded-lg border border-border bg-card p-8 text-center">
               <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
               <h3 className="mt-4 text-base font-medium text-foreground">消息已发送！</h3>
               <p className="mt-2 text-sm text-muted-foreground">{t("contactFormSuccess")}</p>
               <Link
                 href="/"
                 className="mt-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"
               >
                 返回首页 →
               </Link>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6">
               <h2 className="mb-6 text-base font-medium text-foreground">{t("contactFormTitle")}</h2>
               <div className="space-y-4">
                 <div className="grid gap-4 sm:grid-cols-2">
                   <div>
                     <label className="mb-1.5 block text-xs text-foreground">{t("contactFormName")} *</label>
                     <input
                       type="text"
                       required
                       value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                     />
                   </div>
                   <div>
                     <label className="mb-1.5 block text-xs text-foreground">{t("contactFormEmail")} *</label>
                     <input
                       type="email"
                       required
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                     />
                   </div>
                 </div>
                 <div className="grid gap-4 sm:grid-cols-2">
                   <div>
                     <label className="mb-1.5 block text-xs text-foreground">{t("contactFormOrder")}</label>
                     <input
                       type="text"
                       value={formData.orderId}
                       onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                       placeholder="ORD-..."
                       className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                     />
                   </div>
                   <div>
                     <label className="mb-1.5 block text-xs text-foreground">{t("contactFormSubject")} *</label>
                     <select
                       required
                       value={formData.subject}
                       onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                       className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                     >
                       <option value="">请选择</option>
                       <option value="order">{t("ticketCategoryOrder")}</option>
                       <option value="shipping">{t("ticketCategoryShipping")}</option>
                       <option value="return">{t("ticketCategoryReturn")}</option>
                       <option value="product">{t("ticketCategoryProduct")}</option>
                       <option value="other">{t("ticketCategoryOther")}</option>
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="mb-1.5 block text-xs text-foreground">{t("contactFormMessage")} *</label>
                   <textarea
                     required
                     rows={5}
                     value={formData.message}
                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                     className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                   />
                 </div>
                 <button
                   type="submit"
                   className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                 >
                   <MessageSquare className="mr-1.5 inline h-4 w-4" />
                   {t("contactFormSubmit")}
                 </button>
               </div>
             </form>
           )}
         </div>
       </div>
     </div>
   );
 }
