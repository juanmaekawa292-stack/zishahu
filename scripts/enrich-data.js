const path = require("path");
const fs = require("fs");

const RAW_DIRS = [
  "D:\\图快下载器\\淘宝采集\\616",
  "D:\\图快下载器\\淘宝采集\\0615"
];

// Build title -> { folder, videos, hasMainImages } map
const rawMap = {};
for (const rawDir of RAW_DIRS) {
  const folders = fs.readdirSync(rawDir, {withFileTypes:true})
    .filter(f => f.isDirectory())
    .map(f => ({ name: f.name, dir: path.join(rawDir, f.name) }));
  
  for (const f of folders) {
    const files = fs.readdirSync(f.dir);
    const title = f.name.replace(/^\d+_/, "");
    rawMap[title] = {
      title,
      origDir: f.name,
      path: f.dir,
      videos: files.filter(f2 => f2.endsWith(".mp4")).sort(),
      mainImages: files.filter(f2 => f2.startsWith("主图_")).sort(),
      detailImages: files.filter(f2 => f2.startsWith("详情_")).sort(),
    };
  }
}

// Now read products.ts and match each product
const productsTS = fs.readFileSync("src/data/products.ts", "utf8");
const lines = productsTS.split("\n");

const SPEC_FIELDS = ["capacity","clay","craft","material","origin","handmade",
  "firingType","scenario","cleaning","packaging","kiln","year","color","suitableTea","shapeType"];

let matchCount = 0, videoCount = 0, specCount = 0;
let currentTitle = "";
let currentID = "";
const updates = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Capture product ID
  let m = line.match(/id:\s*'(tk-\d+)'/);
  if (m) currentID = m[1];
  
  // Capture title
  m = line.match(/title_zhCN:\s*'(.+)'/);
  if (m) currentTitle = m[1];
  
  // Check if this product has matching raw data
  if (currentTitle && rawMap[currentTitle]) {
    const raw = rawMap[currentTitle];
    let hadUpdate = false;
    
    // Build specs to add
    const newSpecs = {};
    
    // Extract spec info from title
    const title = currentTitle;
    
    // 容量: patterns like "220ml", "约200ml", "201mL(含)-300mL(含)"
    const capMatch = title.match(/([约大]?)(\d+)\s*(ml|mL|ML|ML\b)/);
    if (capMatch && capMatch[0].length < 20) {
      // Don't override existing capacity
    }
    
    // 壶型: patterns like "西施壶", "石瓢壶" etc.
    const shapes = ["西施壶","石瓢壶","仿古壶","汉瓦壶","德钟壶","龙蛋壶",
      "思亭壶","掇球壶","供春壶","提梁壶","竹段壶","容天壶","汉棠石瓢壶",
      "景舟石瓢壶","满石瓢","明炉壶","文旦壶","唐羽壶","汉瓦","仿古"];
    for (const s of shapes) {
      if (title.includes(s)) {
        newSpecs.shapeType = s.replace("壶","");
        break;
      }
    }
    
    if (Object.keys(newSpecs).length > 0) {
      specCount++;
    }
    
    // Videos (add COS paths)
    const cosVideos = raw.videos.map((v, idx) => 
      `"https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/${currentID}/video_${idx+1}.mp4"`
    );
    
    if (cosVideos.length > 0) {
      videoCount += cosVideos.length;
      updates.push({id: currentID, title, videos: cosVideos, raw, newSpecs});
    }
    
    matchCount++;
    currentTitle = ""; // reset
  }
}

console.log("Total matched:", matchCount, "out of", Object.keys(rawMap).length, "raw folders");
console.log("Products with videos:", updates.length);
console.log("Total video files:", videoCount);
console.log("Spec fields found:", specCount);

// Print update summary
for (const u of updates.slice(0, 5)) {
  console.log("  UPDATE:", u.id, u.title.substring(0,30), "videos:", u.videos.length, "specs:", Object.keys(u.newSpecs));
}
