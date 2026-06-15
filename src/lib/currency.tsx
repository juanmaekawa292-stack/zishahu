"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type CurrencyInfo = {
  countryCode: string;
  currency: string;
  symbol: string;
  rate: number;
};

const CurrencyContext = createContext<{
  currency: CurrencyInfo;
  loaded: boolean;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
}>({
  currency: { countryCode: "US", currency: "USD", symbol: "$", rate: 1 },
  loaded: false,
  convert: (v) => v,
  format: (v) => "$" + v.toFixed(2),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    countryCode: "US", currency: "USD", symbol: "$", rate: 1,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/currency")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCurrency({ countryCode: d.countryCode, currency: d.currency, symbol: d.symbol, rate: d.rate });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const convert = (usdAmount: number) => {
    if (!usdAmount) return 0;
    const converted = (usdAmount * currency.rate).toFixed(2);
    return parseFloat(converted);
  };

  const format = (usdAmount: number) => {
    if (usdAmount === undefined || usdAmount === null) return "";
    const converted = convert(usdAmount);
    if (currency.currency === "JPY" || currency.currency === "KRW" || currency.currency === "IDR" || currency.currency === "VND") {
      return currency.symbol + Math.round(converted).toLocaleString();
    }
    return currency.symbol + converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <CurrencyContext.Provider value={{ currency, loaded, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
