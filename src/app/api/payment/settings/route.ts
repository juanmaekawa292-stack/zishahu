import { NextResponse } from "next/server";

var settings: any = { oid_partner: "", private_key: "" };

export async function GET() {
  return NextResponse.json({ success: true, oid_partner: settings.oid_partner, private_key: settings.private_key });
}

export async function POST(request: Request) {
  try {
    var body = await request.json();
    settings.oid_partner = body.oid_partner || "";
    settings.private_key = body.private_key || "";
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}