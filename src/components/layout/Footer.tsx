import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
 const t = useTranslations("common");
 const ts = useTranslations("service");
 const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border/50 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🫖</span>
              <span className="text-lg font-bold tracking-wider text-primary">
                {t("siteName")}
              </span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              专注宜兴紫砂，连接茶与生活。
              <br />
              匠心手作，全球送达。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-foreground">
              快速链接
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">{t("products")}</Link></li>
              <li><Link href="/products?category=new" className="hover:text-primary transition-colors">{t("newArrivals")}</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">{t("cart")}</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">{t("orders")}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-foreground">
              客户服务
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
             <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> hello@zishayaji.com</li>
             <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +1 (888) 000-0000</li>
             <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Yixing, Jiangsu, China</li>
             <li><Link href="/faq" className="hover:text-primary transition-colors">{ts("faq")}</Link></li>
             <li><Link href="/help" className="hover:text-primary transition-colors">{ts("helpCenter")}</Link></li>
             <li><Link href="/faq?cat=returns" className="hover:text-primary transition-colors">{ts("returnsExchanges")}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-foreground">
              订阅更新
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              获取最新紫砂作品和茶文化资讯。
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                订阅
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-[10px] text-muted-foreground">
          {t("footer")}
        </div>
      </div>
    </footer>
  );
}
