import { NextRequest, NextResponse } from "next/server";
import { readJsonFromCos, writeJsonToCos, ORDERS_COS_KEY } from "@/lib/cos";

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

async function loadOrders(): Promise<Record<string, any>> {
  const data = await readJsonFromCos<Record<string, any>>(ORDERS_COS_KEY);
  return data || {};
}

async function saveOrders(orders: Record<string, any>): Promise<void> {
  await writeJsonToCos(ORDERS_COS_KEY, orders);
}

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

    const allOrders = await loadOrders();
    allOrders[orderId] = order;
    await saveOrders(allOrders);

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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const allOrders = await loadOrders();

    if (id) {
      const order = allOrders[id];
      if (!order) {
        return NextResponse.json(
          { error: "订单不存在" },
          { status: 404 }
        );
      }
      return NextResponse.json(order);
    }

    const sorted = Object.values(allOrders).sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await writeJsonToCos(ORDERS_COS_KEY, {});
    return NextResponse.json({ success: true, message: "All orders cleared" });
  } catch (error) {
    console.error("Clear orders error:", error);
    return NextResponse.json({ error: "Failed to clear orders" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

    const updates = await request.json();
    const allOrders = await loadOrders();
    if (!allOrders[id]) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    allOrders[id] = { ...allOrders[id], ...updates, updatedAt: new Date().toISOString() };
    await saveOrders(allOrders);
    return NextResponse.json(allOrders[id]);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
  }
}
