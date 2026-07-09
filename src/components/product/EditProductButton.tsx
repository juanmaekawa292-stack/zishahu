"use client";

import { useRouter, usePathname } from "next/navigation";
import { Pencil } from "lucide-react";

export function EditProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (typeof window !== "undefined") {
      // 从当前路径提取语言前缀
      const locale = pathname.startsWith("/zh-TW") ? "zh-TW" : "zh-CN";
      window.localStorage.setItem("zisha-edit-product-id", productId);
      router.push(`/${locale}/admin/products`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
      title="编辑此商品"
    >
      <Pencil className="h-3 w-3" />
      编辑商品
    </button>
  );
}
