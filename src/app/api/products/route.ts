import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProductBySlug } from "@/lib/runtime-products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    const all = await getProducts();
    return NextResponse.json({ success: true, products: all, total: all.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

