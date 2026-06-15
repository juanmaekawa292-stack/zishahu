const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function processAll() {
  // For each product, output to its own subfolder in processed
  const products = ["tk-003","tk-004","tk-005","tk-006","tk-007","tk-008"];
  for (const prod of products) {
    const inputDir = path.join("data","images","input",prod);
    if (!fs.existsSync(inputDir)) continue;
    
    // Create product output directory
    const outDir = path.join("data","images","processed", prod);
    const detailOutDir = path.join(outDir, "detail");
    fs.mkdirSync(detailOutDir, { recursive: true });
    
    const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png|webp|tiff)$/i.test(f));
    
    for (const f of files) {
      const fp = path.join(inputDir, f);
      let image = sharp(fp);
      
      // First resize to target, then composite
      image = image.resize({ width: 1200, height: 1200, fit: "cover", position: "center", background: { r: 255, g: 255, b: 255, alpha: 1 } });
      
      // Watermark removal at resized dimensions
      const overlaySvg = '<svg width="1200" height="1200">' +
        '<rect x="0" y="1130" width="300" height="70" fill="white" opacity="1"/>' +
        '<rect x="900" y="1130" width="300" height="70" fill="white" opacity="1"/>' +
        "</svg>";
      image = image.composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }]);
      
      const outputName = f.replace(/\.(jpg|jpeg|png|webp|tiff)$/i, ".webp");
      const outputPath = path.join(outDir, outputName);
      await image.webp({ quality: 85, effort: 4 }).toFile(outputPath);
      console.log("  " + prod + "/" + f + " -> " + outputName);
    }
    
    const detailDir = path.join(inputDir, "detail");
    if (fs.existsSync(detailDir)) {
      const detailFiles = fs.readdirSync(detailDir).filter(f => /\.(jpg|jpeg|png|webp|tiff)$/i.test(f));
      for (const df of detailFiles) {
        const dfp = path.join(detailDir, df);        
        let image = sharp(dfp);
        image = image.resize({ width: 1500, height: null, fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 1 } });
        
        const meta2 = await image.metadata();
        const dh = meta2.height || 2000;
        
        const overlaySvg = '<svg width="1500" height="' + dh + '">' +
          '<rect x="0" y="' + (dh - 70) + '" width="300" height="70" fill="white" opacity="1"/>' +
          '<rect x="1200" y="' + (dh - 70) + '" width="300" height="70" fill="white" opacity="1"/>' +
          "</svg>";
        image = image.composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }]);
        
        const outputName = df.replace(/\.(jpg|jpeg|png|webp|tiff)$/i, ".webp");
        const outputPath = path.join(detailOutDir, outputName);
        await image.webp({ quality: 80, effort: 4 }).toFile(outputPath);
        console.log("  " + prod + "/detail/" + df + " -> " + outputName);
      }
    }
  }
}
processAll().then(() => console.log("Done!")).catch(e => console.error(e));

