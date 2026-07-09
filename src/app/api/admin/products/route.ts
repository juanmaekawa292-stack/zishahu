import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/runtime-products";

export async function PUT(req: NextRequest) {
  try {
    const { id, updates } = await req.json();
    if (!id || !updates) return NextResponse.json({ success: false, error: "Missing id or updates" }, { status: 400 });

    await updateProduct(id, updates);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
