import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";

export async function generateStaticParams() {
  return [{ locale: "zh-CN" }, { locale: "zh-TW" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <GoogleAnalytics />
      <FacebookPixel />
      {/* Organization Schema for brand SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "紫砂雅集",
            alternateName: "Zisha Artisan | Zishapro",
            url: "https://zishapro.com",
            logo: "https://zishapro.com/logo.png",
            description:
              "专注宜兴紫砂壶、茶具跨境销售，手工制作，全球送达。",
            sameAs: [],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: ["Chinese", "English"],
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
