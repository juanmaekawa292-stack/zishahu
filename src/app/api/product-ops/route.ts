import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const RAW_DIR = path.join(DATA_DIR, "raw_products");
const PROCESSED_DIR = path.join(DATA_DIR, "processed_products");
const EXPORT_DIR = path.join(DATA_DIR, "exports");

export async function GET() {
  try {
    // Read raw products
    let rawFiles: string[] = [];
    let rawProducts: any[] = [];
    if (fs.existsSync(RAW_DIR)) {
      rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith(".json") && !f.startsWith("."));
      for (const f of rawFiles.slice(0, 50)) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(RAW_DIR, f), "utf-8"));
          const items = Array.isArray(data) ? data : [data];
          rawProducts.push(...items.map(item => ({
            source_title: item.source_title || f,
            source_price: item.source_price,
            source_sku: item.source_sku || "",
            source_url: item.source_url || "",
            category: item.category || "",
            file: f,
          })));
        } catch { /* skip unparseable */ }
      }
    }

    // Read processed products
    let processedProducts: any[] = [];
    if (fs.existsSync(PROCESSED_DIR)) {
      const processedFiles = fs.readdirSync(PROCESSED_DIR).filter(f => f.endsWith(".json"));
      for (const f of processedFiles) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(PROCESSED_DIR, f), "utf-8"));
          processedProducts.push(data);
        } catch { /* skip */ }
      }
    }
    processedProducts.sort((a, b) => b.id.localeCompare(a.id));

    // Read exports
    let exports: string[] = [];
    if (fs.existsSync(EXPORT_DIR)) {
      exports = fs.readdirSync(EXPORT_DIR).filter(f => f.endsWith(".csv")).sort().reverse();
    }

    return NextResponse.json({
      stats: {
        rawCount: rawProducts.length,
        processedCount: processedProducts.length,
        exportCount: exports.length,
        pendingReview: processedProducts.filter(p => !p.reviewed).length,
      },
      rawProducts,
      processedProducts,
      exports: exports.slice(0, 10),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}