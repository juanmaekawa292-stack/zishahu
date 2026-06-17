const XLSX = require("xlsx");
const refFile = "D:/图快下载器/淘宝采集/616/75_古悦堂宜兴紫砂壶纯手工泡茶壶一人独饮小壶功夫茶具单壶汉棠石瓢/下载详情_2026-06-16_08_35_39.xlsx";
const wb = XLSX.readFile(refFile);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log("=== 列头 ===");
console.log(data[0].map((c,i) => i + ":" + c).join("\n"));
console.log("=== 第1行数据（参考商品） ===");
const r = data[1];
const cols = ["货号","商品链接","店铺名称","商品名称","主图","主图视频","详情图","SKU图片","SKU信息","采集图片数","采集视频数"];
for (let i = 0; i < cols.length; i++) {
  let val = (r[i] || "").toString();
  if (val.length > 300) val = val.substring(0, 300) + "...(" + r[i].toString().length + "字)";
  console.log(i + " [" + cols[i] + "]: " + val);
}
// SKU structure
const skuRaw = r[8] || "";
try {
  const sku = JSON.parse(skuRaw);
  console.log("\n=== SKU信息结构 ===");
  if (Array.isArray(sku)) {
    console.log("数组长度:", sku.length);
    console.log("第1个:", JSON.stringify(sku[0]).substring(0, 300));
  } else {
    console.log("对象:", JSON.stringify(sku).substring(0, 500));
  }
} catch(e) {
  console.log("SKU非JSON格式");
}
// Counts
const mainCount = (r[4] || "").toString().split("\n").filter(Boolean).length;
const detailCount = (r[6] || "").toString().split("\n").filter(Boolean).length;
const skuImgCount = (r[7] || "").toString().split("\n").filter(Boolean).length;
console.log("主图:" + mainCount + " 详情图:" + detailCount + " SKU图片:" + skuImgCount);
