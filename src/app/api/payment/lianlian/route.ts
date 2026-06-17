import { NextRequest, NextResponse } from "next/server";

interface CreateOrderParams {
  oid_partner: string;
  no_order: string;
  dt_order: string;
  name_goods: string;
  money_order: string;
  notify_url: string;
  return_url: string;
  user_id: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, title, userId } = body;

    if (!orderId || !amount || !title) {
      return NextResponse.json({ error: "缺少订单参数" }, { status: 400 });
    }

    // 从环境变量读取连连支付配置
    const oid_partner = process.env.LIANLIAN_OID_PARTNER;
    const private_key = process.env.LIANLIAN_PRIVATE_KEY;
    const notify_url = process.env.LIANLIAN_NOTIFY_URL || "https://zishapro.com/api/payment/lianlian/notify";
    const return_url_base = process.env.LIANLIAN_RETURN_URL || "https://zishapro.com/orders";

    if (!oid_partner || !private_key) {
      return NextResponse.json(
        { error: "连连支付未配置，请在环境变量中设置 LIANLIAN_OID_PARTNER 和 LIANLIAN_PRIVATE_KEY" },
        { status: 400 }
      );
    }

    const now = new Date();
    const dt_order = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");
    const timestamp = Math.floor(now.getTime() / 1000).toString();
    const returnUrl = return_url_base + "/" + orderId;

    // 构建签名数据
    const signData: Record<string, any> = {
      oid_partner,
      no_order: orderId,
      dt_order,
      name_goods: title.substring(0, 40),
      money_order: amount.toFixed(2),
      notify_url,
      return_url: returnUrl,
      user_id: userId || "guest",
      timestamp,
    };

    // RSA-SHA256签名
    const NodeRSA = (await import("node-rsa")).default;
    const rsa = new NodeRSA(private_key);
    rsa.setOptions({ signingScheme: "pkcs1-sha256" });
    const keys = Object.keys(signData).sort();
    const signStr = keys.map(k => k + "=" + signData[k]).join("&");
    const sign = rsa.sign(signStr, "base64");

    // 调连连支付API
    const payBody = { ...signData, sign, sign_type: "RSA" };
    const res = await fetch("https://api.lianlianpay.com/gateway/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payBody),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "连连支付请求失败" }, { status: 500 });
    }

    const result = await res.json();

    if (result.ret_code !== "0000") {
      return NextResponse.json(
        { error: "连连支付错误: " + (result.ret_msg || result.ret_code) },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      pay_url: result.pay_url,
      qr_code: result.qr_code,
      oid_paybill: result.oid_paybill,
    });
  } catch (e) {
    console.error("[LianLian] Error:", e);
    return NextResponse.json({ error: "支付请求失败" }, { status: 500 });
  }
}
