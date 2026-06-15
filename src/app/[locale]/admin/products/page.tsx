"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";

import { useTranslations } from "next-intl";
import { Plus, Edit, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { products } from "@/data/products";
import { Link } from "@/i18n";


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

function EditModal({ product, open, onClose }: { product: any; open: boolean; onClose: () => void }) {
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [inStock, setInStock] = useState(product?.inStock !== false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) { setPrice(product.price); setStock(product.stock); setInStock(product.inStock !== false); }
  }, [product]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, updates: { price, stock, inStock } }),
      });
      const d = await res.json();
      if (d.success) { alert("保存成功"); onClose(); window.location.reload(); }
      else alert("保存失败: " + d.error);
    } catch(e: any) { alert("保存失败: " + e.message); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>编辑商品</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm font-medium">{product?.title_zhCN}</p>
          <div>
            <label className="text-xs">价格</label>
            <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value)||0)}
              className="w-full rounded border p-2 text-sm bg-background" step="0.01" />
          </div>
          <div>
            <label className="text-xs">库存</label>
            <input type="number" value={stock} onChange={e => setStock(parseInt(e.target.value)||0)}
              className="w-full rounded border p-2 text-sm bg-background" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="accent-primary" />
            上架
          </label>
          <button onClick={save} disabled={saving}
            className="w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default function AdminProductsPage() {
  const router = useRouter();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); }
    else { setAuthorized(true); }
  }, [router]);

  if (!authorized) return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
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
      {editProduct && <EditModal product={editProduct} open={!!editProduct} onClose={() => setEditProduct(null)} />}
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