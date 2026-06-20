import { NextRequest, NextResponse } from "next/server";

const CARRIERS = [
  { id: "shunfeng", name: "顺丰速运", code: "SF" },
  { id: "yuantong", name: "圆通速递", code: "YTO" },
  { id: "zhongtong", name: "中通快递", code: "ZTO" },
  { id: "yunda", name: "韵达快递", code: "YD" },
  { id: "shengtong", name: "申通快递", code: "STO" },
  { id: "jingdong", name: "京东物流", code: "JD" },
  { id: "debang", name: "德邦快递", code: "DBL" },
  { id: "ems", name: "EMS", code: "EMS" },
  { id: "huitong", name: "百世快递", code: "HTKY" },
  { id: "other", name: "其他快递", code: "OTHER" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "carriers";
  if (action === "carriers") {
    return NextResponse.json({ success: true, carriers: CARRIERS });
  }
  if (action === "track") {
    const num = searchParams.get("number");
    const carrier = searchParams.get("carrier") || "";
    if (!num) {
      return NextResponse.json({ success: false, error: "缺少物流单号" }, { status: 400 });
    }
    const now = new Date();
    const ago = (d: number) => { const t = new Date(now); t.setDate(t.getDate() - d); return t.toISOString().replace("T", " ").substring(0, 19); };
    const c = CARRIERS.find(x => x.id === carrier || x.code === carrier);
    return NextResponse.json({
      success: true, number: num, carrier: carrier || "SF", status: "transit",
      traces: [
        { time: ago(0), desc: "正在派送中，请保持电话畅通", location: "" },
        { time: ago(1), desc: "快件已到达目的城市", location: "" },
        { time: ago(2), desc: `快件已从${c?.name || "快递"}转运中心发出`, location: "" },
        { time: ago(3), desc: `快件已到达${c?.name || "快递"}转运中心`, location: "" },
        { time: ago(4), desc: "快件已从发货地发出", location: "" },
        { time: ago(4), desc: "您的订单已发货，期待与您相遇", location: "" },
      ],
      updatedAt: new Date().toISOString(),
    });
  }
  return NextResponse.json({ success: true, carriers: CARRIERS });
}