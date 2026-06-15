import { NextRequest, NextResponse } from "next/server";

var CURRENCY_MAP: Record<string, { code: string; symbol: string; rate: number }> = {
  US: { code: "USD", symbol: "$", rate: 1 },
  CN: { code: "CNY", symbol: "¥", rate: 7.25 },
  TW: { code: "TWD", symbol: "NT$", rate: 32.50 },
  HK: { code: "HKD", symbol: "HK$", rate: 7.82 },
  JP: { code: "JPY", symbol: "¥", rate: 158.50 },
  KR: { code: "KRW", symbol: "₩", rate: 1385 },
  GB: { code: "GBP", symbol: "£", rate: 0.79 },
  DE: { code: "EUR", symbol: "€", rate: 0.93 },
  FR: { code: "EUR", symbol: "€", rate: 0.93 },
  IT: { code: "EUR", symbol: "€", rate: 0.93 },
  AU: { code: "AUD", symbol: "A$", rate: 1.53 },
  CA: { code: "CAD", symbol: "C$", rate: 1.37 },
  SG: { code: "SGD", symbol: "S$", rate: 1.35 },
  MY: { code: "MYR", symbol: "RM", rate: 4.72 },
  TH: { code: "THB", symbol: "฿", rate: 36.80 },
  VN: { code: "VND", symbol: "₫", rate: 25450 },
  ID: { code: "IDR", symbol: "Rp", rate: 16300 },
  PH: { code: "PHP", symbol: "₱", rate: 58.50 },
  IN: { code: "INR", symbol: "₹", rate: 83.50 },
};

export async function GET(req: NextRequest) {
  try {
    var ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    var countryCode = "US";
    if (ip && ip !== "127.0.0.1" && !ip.startsWith("::1") && !ip.startsWith("192.168")) {
      try {
        var geo = await (await fetch("http://ip-api.com/json/" + ip + "?fields=countryCode", { signal: AbortSignal.timeout(3000) })).json();
        if (geo.countryCode) countryCode = geo.countryCode;
      } catch {}
    }
    var currency = CURRENCY_MAP[countryCode] || CURRENCY_MAP.US;
    return NextResponse.json({ success: true, countryCode: countryCode, currency: currency.code, symbol: currency.symbol, rate: currency.rate, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ success: true, countryCode: "US", currency: "USD", symbol: "$", rate: 1 });
  }
}