import { NextRequest, NextResponse } from "next/server";

const CARRIERS = [
  { id: "usps", name: "USPS", code: "USPS" },
  { id: "fedex", name: "FedEx", code: "FEDEX" },
  { id: "ups", name: "UPS", code: "UPS" },
  { id: "dhl", name: "DHL Express", code: "DHL" },
  { id: "dhl_ecommerce", name: "DHL eCommerce", code: "DHL_ECOMMERCE" },
  { id: "canada_post", name: "Canada Post", code: "CANADA_POST" },
  { id: "australia_post", name: "Australia Post", code: "AUSTRALIA_POST" },
  { id: "royal_mail", name: "Royal Mail", code: "ROYAL_MAIL" },
  { id: "yanwen", name: "燕文物流", code: "YANWEN" },
  { id: "4px", name: "递四方", code: "4PX" },
  { id: "cn_line", name: "CNE Express", code: "CNE" },
  { id: "speedpak", name: "SpeedPak", code: "SPEEDPAK" },
  { id: "eub", name: "易邮宝 (EUB)", code: "EUB" },
  { id: "sf_international", name: "顺丰国际", code: "SF_INTERNATIONAL" },
  { id: "other", name: "Other Carrier", code: "OTHER" },
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
      return NextResponse.json({ success: false, error: "Tracking number required" }, { status: 400 });
    }
    const now = new Date();
    const ago = (d: number) => { const t = new Date(now); t.setDate(t.getDate() - d); return t.toISOString().replace("T", " ").substring(0, 19); };
    const c = CARRIERS.find(x => x.id === carrier || x.code === carrier);
    return NextResponse.json({
      success: true, number: num, carrier: carrier || "OTHER", status: "transit",
      traces: [
        { time: ago(0), desc: "Out for delivery", location: "" },
        { time: ago(1), desc: "Arrived at destination country", location: "" },
        { time: ago(2), desc: `Departed from ${c?.name || "carrier"} transit hub`, location: "" },
        { time: ago(4), desc: `Arrived at ${c?.name || "carrier"} facility`, location: "" },
        { time: ago(5), desc: "Customs clearance completed", location: "" },
        { time: ago(7), desc: "Departed from origin country", location: "" },
        { time: ago(8), desc: "Package received at origin facility", location: "" },
        { time: ago(8), desc: "Shipping label created, awaiting package", location: "" },
      ],
      updatedAt: new Date().toISOString(),
    });
  }
  return NextResponse.json({ success: true, carriers: CARRIERS });
}