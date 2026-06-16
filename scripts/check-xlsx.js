const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const dir = "D:\\图快下载器\\淘宝采集\\616";
const folders = fs.readdirSync(dir, {withFileTypes:true}).filter(f=>f.isDirectory()).map(f=>f.name);
const firstDir = path.join(dir, folders[0]);
const files = fs.readdirSync(firstDir);
const xlsxFile = files.find(f=>f.endsWith(".xlsx"));
console.log("First folder:", folders[0]);
console.log("XLSX file:", xlsxFile);
if(xlsxFile) {
  const wb = XLSX.readFile(path.join(firstDir, xlsxFile));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {defval:""});
  console.log("Rows:", data.length);
  const keys = Object.keys(data[0] || {});
  console.log("Columns:", keys.length);
  keys.forEach(k => console.log("  Col:", k));
  data.forEach((r,i) => {
    console.log("Row " + i + ":", JSON.stringify(r).substring(0,300));
  });
}
