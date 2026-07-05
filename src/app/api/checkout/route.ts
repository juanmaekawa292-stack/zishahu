import { NextRequest, NextResponse } from "next/server";

interface CheckoutItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    title_zhCN: string;
    price: number;
    slug?: string;
    sourceUrl?: string;
    sourceSku?: string;
  };
}

interface CheckoutBody {
  items: CheckoutItem[];
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  contactMethod?: string;
  contactId?: string;
  paypalOrderId?: string;
}

const orders = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "购物车为空" },
        { status: 400 }
      );
    }

    if (!body.address?.name || !body.address?.street || !body.address?.city || !body.address?.zip) {
      return NextResponse.json(
        { error: "请填写完整的收货地址" },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // 构建商品溯源映射
  const sourceMap: Record<string, { sourceUrl: string; sourceSku?: string }> = {};
  for (const item of body.items) {
    if (item.product?.sourceUrl) {
      sourceMap[item.productId] = {
        sourceUrl: item.product.sourceUrl,
        sourceSku: item.product.sourceSku,
      };
    }
  }

const order = {
      id: orderId,
      items: body.items,
      address: body.address,
      shippingMethod: body.shippingMethod,
      paymentMethod: body.paymentMethod,
    subtotal: body.subtotal,
    shipping: body.shipping,
    tax: body.tax,
    total: body.total,
    contactMethod: body.contactMethod,
    contactId: body.contactId,
    paypalOrderId: body.paypalOrderId,
    status: "pending" as const,
    sourceMap,
    createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.set(orderId, order);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "创建订单失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const order = orders.get(id);
    if (!order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  }

 return NextResponse.json(Array.from(orders.values()));
}

export async function DELETE() {
  try {
    orders.clear();
    return NextResponse.json({ success: true, message: "All orders cleared" });
  } catch (error) {
    console.error("Clear orders error:", error);
    return NextResponse.json({ error: "Failed to clear orders" }, { status: 500 });
  }
}
