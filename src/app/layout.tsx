import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | 紫砂雅集",
    default: "紫砂雅集 - 宜兴紫砂跨境茶具商城",
  },
  description:
    "专注宜兴紫砂壶、茶具跨境销售，手工制作，全球送达。为海外华人提供正宗的宜兴紫砂壶和茶具。",
  metadataBase: new URL("https://zisha.hu"),
  openGraph: {
    title: "紫砂雅集 - 宜兴紫砂跨境茶具商城",
    description:
      "专注宜兴紫砂壶、茶具跨境销售，手工制作，全球送达。",
    siteName: "紫砂雅集",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "紫砂雅集 - 宜兴紫砂跨境茶具商城",
    description:
      "专注宜兴紫砂壶、茶具跨境销售，手工制作，全球送达。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
