"use client";

 import { useTranslations } from "next-intl";
 import { useState } from "react";
 import { ShoppingCart, Menu, X, Heart, ChevronDown, HelpCircle } from "lucide-react";
 import { Link, usePathname } from "@/i18n";
 import { useCartStore } from "@/store/cart";
 import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

const navLinks = [
  { href: "/", label: t("home") },
  { href: "/products", label: t("products") },
  { href: "/products?category=teapot", label: t("categories") },
  { href: "/blog", label: t("blog") },
  { href: "/faq", label: "FAQ" },
];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">??</span>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wider text-primary">
              {t("siteName")}
            </span>
            <span className="text-[10px] tracking-[0.15em] text-muted-foreground">
              {t("siteSubtitle")}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switch */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border"
            >
              <span>{t("zhCN")}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-border bg-card shadow-lg">
                  <Link
                    href={pathname}
                    locale="zh-CN"
                    className="block px-3 py-2 text-xs hover:bg-muted transition-colors"
                    onClick={() => setLangOpen(false)}
                  >
                    {t("zhCN")}
                  </Link>
                  <Link
                    href={pathname}
                    locale="zh-TW"
                    className="block px-3 py-2 text-xs hover:bg-muted transition-colors"
                    onClick={() => setLangOpen(false)}
                  >
                    {t("zhTW")}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Wishlist */}
          <Link href="/wishlist" className="hidden sm:flex p-2 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background animate-fadeIn">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 space-y-1 border-t border-border/50">
              <Link
                href="/wishlist"
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("wishlist")}
              </Link>
              <Link
                href="/login"
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("login")}
              </Link>
            </div>
            {/* Mobile Language */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Link href={pathname} locale="zh-CN" className="text-xs px-2 py-1 rounded border border-border" onClick={() => setMobileMenuOpen(false)}>
                {t("zhCN")}
              </Link>
              <Link href={pathname} locale="zh-TW" className="text-xs px-2 py-1 rounded border border-border" onClick={() => setMobileMenuOpen(false)}>
                {t("zhTW")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
