import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/videos") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return intlMiddleware(request);
  }

  const hasLocalePrefix = routing.locales.some(
    (locale) => pathname.startsWith("/" + locale) || pathname === "/" + locale
  );

  if (!hasLocalePrefix) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    const acceptLanguage = request.headers.get("accept-language") || "";
    let detectedLocale = routing.defaultLocale;

    if (country === "TW" || country === "HK" || country === "MO") {
      detectedLocale = "zh-TW";
    } else {
      if (acceptLanguage.includes("zh-TW") || acceptLanguage.includes("zh-Hant")) {
        detectedLocale = "zh-TW";
      } else if (acceptLanguage.includes("zh")) {
        detectedLocale = "zh-CN";
      }
    }

    const url = request.nextUrl.clone();
    url.pathname = "/" + detectedLocale + pathname;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|videos).*)",
  ],
};
