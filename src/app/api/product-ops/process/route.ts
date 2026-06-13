import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "process-product.js");
    const csvDir = path.join(process.cwd(), "data", "exports");

    // Run the processing script
    const result = execSync(`node "${scriptPath}"`, {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 60000,
    });

    // Read generated CSV files
    let csvFiles: string[] = [];
    if (fs.existsSync(csvDir)) {
      csvFiles = fs.readdirSync(csvDir)
        .filter((f: string) => f.endsWith(".csv"))
        .sort()
        .reverse()
        .slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      message: "处理完成，生成了 " + csvFiles.length + " 个CSV文件",
      output: result.split("\n").slice(-10).join("\n"),
      csvFiles,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "处理失败： " + (err.message || err),
      error: err.stderr || "",
    }, { status: 500 });
  }
}
