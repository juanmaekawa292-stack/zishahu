"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/services/auth";
import type { Product } from "@/types";

function EditModal({ product, open, onClose, onSaved }: { product: any; open: boolean; onClose: () => void; onSaved: () => void }) {
  if (!open) return null;
  const [price, setPrice] = useState(product ? product.price : 0);
  const [stock, setStock] = useState(product ? product.stock : 0);
  const [inStock, setInStock] = useState(product && product.inStock !== false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, updates: { price, stock, inStock } }),
      });
      const data = await res.json();
      if (data.success) {
        alert("保存成功！价格=" + price + " 库存=" + stock);
        onClose();
        onSaved();
      } else {
        alert("保存失败: " + (data.error || "未知错误"));
      }
    } catch (e) {
      alert("保存失败: " + e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">编辑 - {product?.title_zhCN}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs block mb-1">价格</label>
            <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full rounded border p-2 text-sm bg-background" step="0.01" />
          </div>
          <div>
            <label className="text-xs block mb-1">库存</label>
            <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value) || 0)} className="w-full rounded border p-2 text-sm bg-background" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-primary" /> 上架
          </label>
          <button onClick={save} disabled={saving} className="w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const [authorized, setAuthorized] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); }
    else { setAuthorized(true); }
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.products);
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) fetchProducts();
  }, [authorized]);

  useEffect(() => {
    const pid = window.localStorage.getItem("zisha-edit-product-id");
    if (pid && allProducts.length > 0) {
      window.localStorage.removeItem("zisha-edit-product-id");
      const prod = allProducts.find((p: any) => p && p.id === pid);
      if (prod) setEditProduct(prod);
    }
  }, [allProducts]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <EditModal product={editProduct} open={!!editProduct} onClose={() => setEditProduct(null)} onSaved={fetchProducts} />
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("products")}</h1>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">商品</th>
              <th className="px-4 py-3 text-left">价格</th>
              <th className="px-4 py-3 text-left">库存</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allProducts.map((p: any) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><p className="text-sm font-medium">{p.title_zhCN}</p></td>
                <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-sm">{String(p.stock)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setEditProduct(p)} title="编辑">
                    <Pencil className="h-3.5 w-3.5 mr-1" /> 编辑
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
