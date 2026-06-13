var fs = require("fs");
var p = "F:/codex-yunxing/zishahu/scripts/process-product-fixed2.js";

var c = fs.readFileSync(p, "utf-8");

// 1) Add batch counter before ID generation
c = c.replace(
  "// ─── ID 生成 ───────────────────────────────────────────",
  "// ─── 批处理计数器（预览模式用）───────────────────────────\nlet _batchIdCounter = 0;\n\n// ─── ID 生成 ───────────────────────────────────────────"
);

// 2) Increment counter inside generateProductId
c = c.replace(
  'function generateProductId(prefix) {\n  if (prefix === undefined) prefix = "zp";\n  var maxNum = 0;',
  'function generateProductId(prefix) {\n  if (prefix === undefined) prefix = "zp";\n  _batchIdCounter++;\n  var maxNum = 0;'
);

// 3) Fix esc function: literal \\n -> actual newline
c = c.replace(
  's.indexOf("\\\\n")',
  's.indexOf("\\n")'
);

// 4) Fix CSV join separator: literal \\n -> actual newline  
c = c.replace(
  '.join("\\\\n")',
  '.join("\\n")'
);

// 5) Reset counter in main()
c = c.replace(
  'var preview = args.indexOf("--preview") >= 0;\n  var specificFile = null;',
  'var preview = args.indexOf("--preview") >= 0;\n  _batchIdCounter = 0;\n  var specificFile = null;'
);

fs.writeFileSync(p, c, "utf-8");
console.log("OK");
