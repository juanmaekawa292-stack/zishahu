import os
content = '''const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const d1 = "D:\\u56fe\\u5feb\\u4e0b\\u8f7d\\u5668\\u6dd8\\u5b9d\\u91c7\\u96c6\\0615";
const d2 = "D:\\u56fe\\u5feb\\u4e0b\\u8f7d\\u5668\\u6dd8\\u5b9d\\u91c7\\u96c6\\0616";

console.log("0615:", fs.existsSync(d1));
console.log("616:", fs.existsSync(d2));

if (fs.existsSync(d1)) {
  const f = fs.readdirSync(d1).filter(x => /^[0-7]/.test(x));
  console.log("0615 folders:", f.length);
}
if (fs.existsSync(d2)) {
  const f = fs.readdirSync(d2).filter(x => /^[0-7]/.test(x));
  console.log("616 folders:", f.length);
}
'''
with open('F:/codex-yunxing/zishahu/scripts/scan-test.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Written OK')
