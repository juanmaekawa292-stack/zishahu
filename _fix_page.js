const fs = require("fs");
const p = "F:/codex-yunxing/zishahu/src/app/[locale]/products/[slug]/page.tsx";
let c = fs.readFileSync(p, "utf-8");

// Fix 1: Restore locale declaration in generateMetadata
c = c.replace("// locale set above", "const locale = await getLocale()");

// Fix 2: Ensure ProductDetailPage has locale variable
// Check if it already has it
if (c.includes("var locale = params?.locale")) {
  console.log("Locale already handled in ProductDetailPage");
} else if (c.includes("const locale")) {
  console.log("locale already defined");
} else {
  // Add locale declaration after slug declaration
  c = c.replace(
    "var slug = params?.slug || \"\";",
    "var slug = params?.slug || \"\";\n  var locale = params?.locale || \"zh-CN\";"
  );
}

// Fix 3: Check if ProductDetailPage imports headers correctly
if (c.includes("await import(\"next/headers\")")) {
  console.log("Headers import already there");
}

fs.writeFileSync(p, c);
console.log("Fixed");
