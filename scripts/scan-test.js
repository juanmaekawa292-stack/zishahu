const XLSX = require("xlsx");
const fs = require("fs");
const d1 = "D:\图快下载器\淘宝采集\0615";
const d2 = "D:\图快下载器\淘宝采集\616";
console.log("0615:", fs.existsSync(d1));
console.log("616:", fs.existsSync(d2));
if (fs.existsSync(d1)) { var f = fs.readdirSync(d1).filter(function(x) { return /^[0-7]/.test(x); }); console.log("0615 folders:", f.length); }
if (fs.existsSync(d2)) { var f = fs.readdirSync(d2).filter(function(x) { return /^[0-7]/.test(x); }); console.log("616 folders:", f.length); }
