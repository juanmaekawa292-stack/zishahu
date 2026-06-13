"use client";

import { useTranslations } from "next-intl";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { products } from "@/data/products";
import { Link } from "@/i18n";

export default function AdminProductsPage() {
  const t = useTranslations("admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("products")}</h1>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          {t("addProduct")}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">商品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">分类</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">价格</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">货号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">来源</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">库存</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-lg">🫖</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.title_zhCN}</p>
                      <p className="text-xs text-muted-foreground">{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.sourceSku || "-"}</td>
                <td className="px-4 py-3 text-xs max-w-[160px] truncate">
                  {p.sourceUrl ? (
                    <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">天猫</a>
                  ) : (
                    <span className="text-muted-foreground">本地</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{p.stock}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.inStock ? "success" : "secondary"} className="text-[10px]">
                    {p.inStock ? "上架" : "下架"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">返回后台首页</Link>
      </div>
    </div>
  );
}