"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { products } from "@/data/products";

function EditModal(_ref: any) {
  var product = _ref.product, open = _ref.open, onClose = _ref.onClose;
  if (!open) return null;
  var _React$useState = React.useState(product ? product.price : 0), price = _React$useState[0], setPrice = _React$useState[1];
  var _React$useState2 = React.useState(product ? product.stock : 0), stock = _React$useState2[0], setStock = _React$useState2[1];
  var _React$useState3 = React.useState(product && product.inStock !== false), inStock = _React$useState3[0], setInStock = _React$useState3[1];
  var save = function() {
    var key = "zisha-product-edits";
    try {
      var edits = JSON.parse(localStorage.getItem(key) || "{}");
      edits[product.id] = { price: price, stock: stock, inStock: inStock };
      localStorage.setItem(key, JSON.stringify(edits));
      alert("保存成功！价格=" + price + " 库存=" + stock);
      onClose();
      window.location.reload();
    } catch(e) { alert("保存失败: " + e); }
  };
  return React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", onClick: onClose },
    React.createElement("div", { className: "bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4 shadow-xl", onClick: function(e: any) { e.stopPropagation(); } },
      React.createElement("h2", { className: "text-lg font-bold mb-4" }, "编辑 - " + (product ? product.title_zhCN : "")),
      React.createElement("div", { className: "space-y-4" },
        React.createElement("div", null, React.createElement("label", { className: "text-xs block mb-1" }, "价格"), React.createElement("input", { type: "number", value: price, onChange: function(e: any) { setPrice(parseFloat(e.target.value) || 0); }, className: "w-full rounded border p-2 text-sm bg-background", step: "0.01" })),
        React.createElement("div", null, React.createElement("label", { className: "text-xs block mb-1" }, "库存"), React.createElement("input", { type: "number", value: stock, onChange: function(e: any) { setStock(parseInt(e.target.value) || 0); }, className: "w-full rounded border p-2 text-sm bg-background" })),
        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
          React.createElement("input", { type: "checkbox", checked: inStock, onChange: function(e: any) { setInStock(e.target.checked); }, className: "accent-primary" }), "上架"),
        React.createElement("button", { onClick: save, className: "w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90" }, "保存")
      )
    )
  );
}

export default function AdminProductsPage() {
  var router = useRouter();
  var t = useTranslations("admin");
  var _useState = useState(false), authorized = _useState[0], setAuthorized = _useState[1];
  var _useState2 = useState<any>(null), editProduct = _useState2[0], setEditProduct = _useState2[1];

  useEffect(function() {
    var user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); }
    else { setAuthorized(true); }
  }, [router])

  useEffect(function() {
    var pid = window.localStorage.getItem("zisha-edit-product-id");
    if (pid) {
      window.localStorage.removeItem("zisha-edit-product-id");
      var prod = products.find(function(p) { return p && p.id === pid; });
      if (prod) setEditProduct(prod);
    }
  }, []);;

  if (!authorized) return React.createElement("div", { className: "flex items-center justify-center min-h-\[60vh\]" }, React.createElement("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }));

  return React.createElement("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" },
    React.createElement(EditModal, { product: editProduct, open: !!editProduct, onClose: function() { setEditProduct(null); } }),
    React.createElement("h1", { className: "text-2xl font-bold text-foreground mb-6" }, t("products")),
    React.createElement("div", { className: "rounded-lg border border-border bg-card overflow-hidden" },
      React.createElement("table", { className: "w-full text-sm" },
        React.createElement("thead", { className: "bg-muted/50" },
          React.createElement("tr", { className: "border-b border-border" },
            React.createElement("th", { className: "px-4 py-3 text-left" }, "商品"),
            React.createElement("th", { className: "px-4 py-3 text-left" }, "价格"),
            React.createElement("th", { className: "px-4 py-3 text-left" }, "库存"),
            React.createElement("th", { className: "px-4 py-3 text-left" }, "操作")
          )
        ),
        React.createElement("tbody", { className: "divide-y divide-border" },
          products.map(function(p) {
            return React.createElement("tr", { key: p.id, className: "hover:bg-muted/30" },
              React.createElement("td", { className: "px-4 py-3" }, React.createElement("p", { className: "text-sm font-medium" }, p.title_zhCN)),
              React.createElement("td", { className: "px-4 py-3 text-sm font-medium" }, formatPrice(p.price)),
              React.createElement("td", { className: "px-4 py-3 text-sm" }, String(p.stock)),
              React.createElement("td", { className: "px-4 py-3" },
                React.createElement(Button, { size: "sm", variant: "outline", className: "h-8", onClick: function() { setEditProduct(p); }, title: "编辑" },
                  React.createElement(Pencil, { className: "h-3.5 w-3.5 mr-1" }), "编辑"
                )
              )
            );
          })
        )
      )
    )
  );
}