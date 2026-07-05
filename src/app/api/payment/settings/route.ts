import { NextResponse } from "next/server";

var settings: any = { oid_partner: "", private_key: "", paypal_client_id: "", paypal_secret: "", paypal_mode: "sandbox" };

export async function GET() {
  return NextResponse.json({
    success: true,
    oid_partner: settings.oid_partner,
    private_key: settings.private_key,
    paypal_client_id: settings.paypal_client_id,
    paypal_secret: settings.paypal_secret,
    paypal_mode: settings.paypal_mode,
  });
}

export async function POST(request: Request) {
  try {
    var body = await request.json();
    settings.oid_partner = body.oid_partner || "";
    settings.private_key = body.private_key || "";
    settings.paypal_client_id = body.paypal_client_id || "";
    settings.paypal_secret = body.paypal_secret || "";
    settings.paypal_mode = body.paypal_mode || "sandbox";
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
// Use env vars as fallback for persistence across Vercel cold starts
var settings: any = {
  oid_partner: process.env.LIANLIAN_OID_PARTNER || "",
  private_key: process.env.LIANLIAN_PRIVATE_KEY || "",
  paypal_client_id: process.env.PAYPAL_CLIENT_ID || "",
  paypal_secret: process.env.PAYPAL_SECRET || "",
  paypal_mode: process.env.PAYPAL_MODE || "sandbox",
};
// POST updates in-memory; env vars override at cold start
