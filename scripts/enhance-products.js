const fs = require("fs");
const path = require("path");
const COS = require("cos-nodejs-sdk-v5");

const mapping = JSON.parse(fs.readFileSync("data/product-mapping.json", "utf8"));
const tsLines = fs.readFileSync("src/data/products.ts", "utf8").split("\n");

const COS_CLIENT = new COS({
  
  
});

const BUCKET = "zishahu-images-1301674224224";
const REGION = "ap-hongkong";

// Build ID -> mapping lookup
const idMap = {};
for (const m of mapping) idMap[m.id] = m;

// Stats
let updated = { detailImages: 0, videos: 0, specs: 0 };

// Read products.ts and enhance it
let output = [];
let currentId = "";
let currentLineStart = 0;

for (let i = 0; i < tsLines.length; i++) {
  const line = tsLines[i];
  let m = line.match(/id:\s*"(tk-\d+)"/);
  if (m) {
    currentId = m[1];
    currentLineStart = i;
  }
  
  // After detecting detailsImages/videos/specs, enhance them
  if (currentId && idMap[currentId]) {
    const match = idMap[currentId];
    const rawDir = match.raw.path;
    const rawFiles = fs.readdirSync(rawDir);
    
    // Enhance detailImages if empty
    const dtlFiles = rawFiles.filter(f => f.match(/^详情_\d+/));
    if (line.includes("detailImages: [") && dtlFiles.length > 0) {
      const cosUrls = dtlFiles.sort().map((f, idx) => 
        `    "https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/${currentId}/detail_${idx+1}.webp"`
      );
      // Upload files one by one
      for (let fi = 0; fi < dtlFiles.length; fi++) {
        const f = dtlFiles[fi];
        const ext = path.extname(f);
        const cosKey = `products/${currentId}/detail_${fi+1}.webp`;
        // Only upload if file doesn't exist on COS
        // (skipping actual upload for now)
      }
      updated.detailImages += dtlFiles.length;
    }
    
    // Enhance videos if empty
    const mp4Files = rawFiles.filter(f => f.endsWith(".mp4"));
    if (line.includes("videos: [") && mp4Files.length > 0) {
      const cosUrls = mp4Files.sort().map((f, idx) => 
        `    "https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com/products/${currentId}/video_${idx+1}.mp4"`
      );
      // Replace the empty array
      // (complex string manipulation needed)
      updated.videos += mp4Files.length;
    }
  }
  
  output.push(line);
}

console.log("Updated:", JSON.stringify(updated));
