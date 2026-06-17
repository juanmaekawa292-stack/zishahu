import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const oid_partner = process.env.LIANLIAN_OID_PARTNER;
    const public_key = process.env.LIANLIAN_PUBLIC_KEY;

    if (!oid_partner || !public_key) {
      console.error("[LianLian] Notify: 连连支付未配置");
      return new NextResponse("FAIL", { status: 400 });
    }

    const body = await request.json();
    const { sign, ...data } = body;

    // RSA验证签名
    const NodeRSA = (await import("node-rsa")).default;
    const rsa = new NodeRSA(public_key);
    rsa.setOptions({ signingScheme: "pkcs1-sha256" });
    const keys = Object.keys(data).filter(k => k !== "sign").sort();
    const signStr = keys.map(k => k + "=" + data[k]).join("&");
    const isValid = rsa.verify(signStr, sign, "base64");

    if (!isValid) {
      console.error("[LianLian] Notify: 签名验证失败");
      return new NextResponse("FAIL", { status: 400 });
    }

    const { no_order, oid_paybill, result_pay, money_order } = data;
    console.log("[LianLian] 支付通知: 订单=" + no_order + ", 结果=" + result_pay + ", 金额=" + money_order);

    if (result_pay === "SUCCESS") {
      console.log("[LianLian] 订单 " + no_order + " 支付成功");
    }

    return new NextResponse("SUCCESS");
  } catch (e) {
    console.error("[LianLian] Notify error:", e);
    return new NextResponse("FAIL", { status: 500 });
  }
}
