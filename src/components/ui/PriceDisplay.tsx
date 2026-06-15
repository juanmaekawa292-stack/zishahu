"use client";
import { useCurrency } from "@/lib/currency";

interface Props { amount: number; className?: string }

export function PriceDisplay({ amount, className }: Props) {
  const { format, loaded } = useCurrency();
  if (!loaded) {
    const fallback = "$" + (amount != null ? Number(amount).toFixed(2) : "0.00");
    return <span className={className}>{fallback}</span>;
  }
  return <span className={className}>{format(amount)}</span>;
}
