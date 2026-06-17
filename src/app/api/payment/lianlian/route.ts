import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const CONFIG_PATH = path.join(process.cwd(), "data", "lianlian-config.json");

interface LianLianConfig {
  oid_partner: string;
  private_key: string;
}

function readConfig(): LianLianConfig | null {
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return { oid_partner: data.oid_partner || "", private_key: data.private_key || "" };
  } catch {
    const oid = process.env.LIANLIAN_OID_PARTNER;
    const key = process.env.LIANLIAN_PRIVATE_KEY;
    if (oid && key) return { oid_partner: oid, private_key: key };
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = readConfig();
    if (!config) {
      return NextResponse.json({ error: "连连支付未配置，请先在后台设置商户信息" }, { status: 400 });
    }

    const body = await request.json();
    const { orderId, amount, title, userId } = body;

    if (!orderId || !amount || !title) {
      return NextResponse.json({ error: "缺少订单参数" }, { status: 400 });
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dt_order = now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) +
      pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    const timestamp = Math.floor(now.getTime() / 1000).toString();
    const returnUrl = "https://zishapro.com/orders/" + orderId;
    const notifyUrl = "https://zishapro.com/api/payment/lianlian/notify";

    // 构建签名数据
    const signData: Record<string, any> = {
      oid_partner: config.oid_partner,
      no_order: orderId,
      dt_order,
      name_goods: title.substring(0, 40),
      money_order: amount.toFixed(2),
      notify_url: notifyUrl,
      return_url: returnUrl,
      user_id: userId || "guest",
      timestamp,
    };

    // RSA-SHA256签名
    const NodeRSA = (await import("node-rsa")).default;
    const rsa = new NodeRSA(config.private_key);
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
      return NextResponse.json({
        error: "连连支付错误: " + (result.ret_msg || result.ret_code)
      }, { status: 400 });
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