"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
}

const currencies: CurrencyConfig[] = [
  { symbol: "$", code: "USD", locale: "en-US" },
  { symbol: "€", code: "EUR", locale: "de-DE" },
  { symbol: "£", code: "GBP", locale: "en-GB" },
  { symbol: "¥", code: "JPY", locale: "ja-JP" },
  { symbol: "A$", code: "AUD", locale: "en-AU" },
  { symbol: "CA$", code: "CAD", locale: "en-CA" },
];

const STORAGE_KEY = "zishahu_currency";

function getStoredCurrency(): CurrencyConfig {
  if (typeof window === "undefined") return currencies[0];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = currencies.find((c) => c.code === stored);
      if (found) return found;
    }
  } catch {}
  return currencies[0];
}

export function CurrencySelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CurrencyConfig>(currencies[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(getStoredCurrency());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (currency: CurrencyConfig) => {
    setSelected(currency);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, currency.code);
    } catch {}
    // Update the useCurrency hook's cache by writing to a global
    // The format function on the server side reads /api/currency, so
    // we override the cache by setting a window-level override.
    if (typeof window !== "undefined") {
      (window as any).__CURRENCY_OVERRIDE__ = {
        symbol: currency.symbol,
        code: currency.code,
        rate: 1,
      };
      // Force re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent("currency-change", { detail: currency }));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border min-w-[60px]"
      >
        <span>{selected.symbol}</span>
        <span className="hidden sm:inline">{selected.code}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-28 rounded-md border border-border bg-card shadow-lg">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors ${
                selected.code === currency.code ? "bg-primary/10 font-medium text-primary" : "text-foreground"
              }`}
            >
              <span className="w-5 text-center">{currency.symbol}</span>
              <span>{currency.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
