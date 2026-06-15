import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function PUT(req: NextRequest) {
  try {
    const { id, updates } = await req.json();
    if (!id || !updates) return NextResponse.json({ success: false, error: "Missing id or updates" }, { status: 400 });

    const tsPath = path.join(process.cwd(), "src/data/products.ts");
    let content = fs.readFileSync(tsPath, "utf-8");

    const idIdx = content.indexOf('id: "' + id + '"');
    if (idIdx < 0) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    const entryStart = content.lastIndexOf("  {", idIdx);
    const entryEnd = content.indexOf("  },", idIdx);
    if (entryStart < 0 || entryEnd < 0) return NextResponse.json({ success: false, error: "Cannot parse entry" }, { status: 500 });

    let entry = content.slice(entryStart, entryEnd + 4);

    for (const [key, value] of Object.entries(updates)) {
      const valStr = typeof value === "string" ? '"' + value + '"' : String(value);
      const fieldRegex = new RegExp("(" + key + ':)[^,]+');
      entry = entry.replace(fieldRegex, "$1 " + valStr);
    }

    content = content.slice(0, entryStart) + entry + content.slice(entryEnd + 4);
    fs.writeFileSync(tsPath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
