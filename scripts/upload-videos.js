const fs = require("fs");
const path = require("path");
const COS = require("cos-nodejs-sdk-v5");

const mapping = JSON.parse(fs.readFileSync("data/product-mapping.json", "utf8"));

const cos = new COS({
  
  
});

const BUCKET = "zishahu-images-1301674224";

async function uploadFile(localPath, cosKey) {
  try {
    await cos.putObject({
      Bucket: BUCKET,
      Region: "ap-hongkong",
      Key: cosKey,
      Body: fs.createReadStream(localPath),
      ContentLength: fs.statSync(localPath).size
    });
    await cos.putObjectAcl({
      Bucket: BUCKET,
      Region: "ap-hongkong",
      Key: cosKey,
      GrantRead: "uri=\"http://cam.qcloud.com/groups/global/AllUsers\""
    });
    return true;
  } catch(e) {
    console.log("  FAIL:", e.message.substring(0, 80));
    return false;
  }
}

async function processProduct(m) {
  const rawDir = m.raw.path;
  const files = fs.readdirSync(rawDir);
  
  // Upload video files
  const mp4Files = files.filter(f => f.endsWith(".mp4")).sort();
  for (let i = 0; i < mp4Files.length; i++) {
    const localPath = path.join(rawDir, mp4Files[i]);
    const cosKey = "products/" + m.id + "/video_" + (i+1) + ".mp4";
    console.log("Uploading video:", m.id, mp4Files[i]);
    await uploadFile(localPath, cosKey);
  }
  
  // Upload detail images (convert to webp)
  const dtlFiles = files.filter(f => f.match(/^[\u8be6\u60c5]_\d+/));
  // note: detail image upload needs sharp for conversion, skip for now
  
  return mp4Files.length;
}

(async () => {
  const withVideos = mapping.filter(m => {
    try {
      const files = fs.readdirSync(m.raw.path);
      return files.some(f => f.endsWith(".mp4"));
    } catch { return false; }
  });
  console.log("Products with videos:", withVideos.length);
  
  let uploaded = 0;
  for (const m of withVideos) {
    const count = await processProduct(m);
    uploaded += count;
    console.log("Progress:", m.id, count, "videos");
  }
  console.log("Total uploaded:", uploaded);
})();
