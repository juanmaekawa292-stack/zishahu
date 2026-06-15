"use client";

import { useState, useEffect } from "react";

interface CurrencyInfo {
  symbol: string;
  rate: number;
  code: string;
}

var cache: CurrencyInfo | null = null;
var cachePromise: Promise<CurrencyInfo> | null = null;

function loadCurrency(): Promise<CurrencyInfo> {
  if (cache) return Promise.resolve(cache);
  if (cachePromise) return cachePromise;
  cachePromise = fetch("/api/currency").then(function(r) { return r.json(); }).then(function(d) {
    cache = { symbol: d.symbol || "$", rate: d.rate || 1, code: d.currency || "USD" };
    return cache!;
  }).catch(function() {
    cache = { symbol: "$", rate: 1, code: "USD" };
    return cache!;
  });
  return cachePromise;
}

export function useCurrency() {
  var _useState = useState<CurrencyInfo>({ symbol: "$", rate: 1, code: "USD" });
  var currency = _useState[0];
  var setCurrency = _useState[1];
  var _useState2 = useState(false);
  var loaded = _useState2[0];
  var setLoaded = _useState2[1];

  useEffect(function() {
    loadCurrency().then(function(c) {
      setCurrency(c);
      setLoaded(true);
    });
  }, []);

  var convert = function(usd: number) { return usd * currency.rate; };

  var format = function(usd: number) {
    if (usd == null || isNaN(usd)) return "";
    var v = convert(usd);
    if (currency.code === "JPY" || currency.code === "KRW" || currency.code === "IDR" || currency.code === "VND") {
      return currency.symbol + Math.round(v).toLocaleString();
    }
    return currency.symbol + v.toFixed(2);
  };

  return { currency: currency, loaded: loaded, convert: convert, format: format };
}