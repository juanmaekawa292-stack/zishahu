import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { Mail, MessageSquare, MapPin, ChevronRight } from "lucide-react";

export function Footer() {
 const t = useTranslations("common");
 const ts = useTranslations("service");
 const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/30 bg-card">
      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🫖</span>
              <span className="text-lg font-bold tracking-wider text-primary">{t("siteName")}</span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              专注宜兴紫砂，匠心手作，全球送达。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-foreground">快速链接</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li><Link href="/products" className="flex items-center gap-1 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" />{t("products")}</Link></li>
              <li><Link href="/products?sort=newest" className="flex items-center gap-1 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" />新品上架</Link></li>
              <li><Link href="/cart" className="flex items-center gap-1 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" />{t("cart")}</Link></li>
              <li><Link href="/orders" className="flex items-center gap-1 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" />{t("orders")}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-foreground">客户服务</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
             <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" /> zishapro@163.com</li>
             <li className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary/70" /> WhatsApp / Telegram</li>
             <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" /> Yixing, Jiangsu</li>
             <li className="mt-2"><Link href="/faq" className="flex items-center gap-1 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" />{ts("faq")}</Link></li>
             <li><Link href="/help" className="flex items-center gap-1 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" />{ts("helpCenter")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/30 pt-6 text-center text-[10px] text-muted-foreground">
          <p>© {year} {t("siteName")}. {t("footer")}</p>
        </div>
      </div>
    </footer>
  );
}
