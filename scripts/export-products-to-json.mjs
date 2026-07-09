 /**
  * Export products.ts → products.json
  * Run at build time so the JSON file is available for runtime reads.
  * The admin API also writes to this file, so local changes take effect immediately.
  */
 import fs from "fs";
 import path from "path";
 import { fileURLToPath } from "url";
 
 const __dirname = path.dirname(fileURLToPath(import.meta.url));
 const root = path.resolve(__dirname, "..");
 
 // Dynamically import the products module
 const productsModule = await import(path.join(root, "src/data/products.ts"));
 const products = productsModule.products;
 
 const outPath = path.join(root, "src/data/products.json");
 fs.writeFileSync(outPath, JSON.stringify(products, null, 2), "utf-8");
 console.log(`Exported ${products.length} products to ${outPath}`);
