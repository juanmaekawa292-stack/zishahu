import os, re

p = r'F:\codex-yunxing\zishahu\src\app\[locale]\checkout\page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. 在支付方式列表中加连连支付
old_payments = '''{ id: "stripe", label: tCheckout("stripe"), Icon: CreditCard },
                { id: "paypal", label: tCheckout("paypal"), Icon: DollarSvg },'''

new_payments = '''{ id: "stripe", label: tCheckout("stripe"), Icon: CreditCard },
                { id: "paypal", label: tCheckout("paypal"), Icon: DollarSvg },
                { id: "lianlian", label: "\u8fde\u8fde\u652f\u4ed8", Icon: CreditCard },'''

c = c.replace(old_payments, new_payments)

# 2. 更新handleSubmit, 如果是连连支付则调API获取支付链接并跳转
old_submit = '''const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          shippingMethod,
          paymentMethod,
          subtotal,
          shipping,
          tax,
          total,
        }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const order = await res.json();
      clearCart();
      router.push(/orders/);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("\u63d0\u4ea4\u8ba2\u5355\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5");
    } finally {
      setIsSubmitting(false);
    }
  };'''

new_submit = '''const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // \u5148\u521b\u5efa\u8ba2\u5355
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          shippingMethod,
          paymentMethod,
          subtotal,
          shipping,
          tax,
          total,
        }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const order = await res.json();
      clearCart();

      // \u5982\u679c\u662f\u8fde\u8fde\u652f\u4ed8\uff0c\u8df3\u8f6c\u652f\u4ed8\u9875\u9762
      if (paymentMethod === "lianlian") {
        const payRes = await fetch("/api/payment/lianlian", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            amount: total,
            title: items.map(i => i.product.title_zhCN).join(", ").substring(0, 40),
            userId: address.name,
          }),
        });
        const payData = await payRes.json();
        if (payData.success && payData.pay_url) {
          window.location.href = payData.pay_url;
          return;
        }
      }

      router.push(/orders/);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("\u63d0\u4ea4\u8ba2\u5355\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5");
    } finally {
      setIsSubmitting(false);
    }
  };'''

c = c.replace(old_submit, new_submit)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print('\u652f\u4ed8\u9875\u9762\u5df2\u66f4\u65b0')
