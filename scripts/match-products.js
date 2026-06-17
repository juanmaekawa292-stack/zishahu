const fs = require("fs");

// Read raw titles from JSON
const rawTitles = JSON.parse(fs.readFileSync("data/raw-titles.json", "utf8"));
const ts = fs.readFileSync("src/data/products.ts", "utf8").split("\n");

function normalize(s) {
  return s.replace(/[\/\-\(\)（）,，、\.\s]/g, "").toLowerCase();
}

function matchProduct(ts, rawTitles) {
  const rawMap = {};
  for (const r of rawTitles) {
    const norm = normalize(r.title);
    rawMap[norm] = r;
  }
  
  const results = [];
  let currentId = "", currentTitle = "";
  let matchCount = 0, fuzzyCount = 0;
  
  for (const line of ts) {
    let m = line.match(/id:\s*"(tk-\d+)"/);
    if (m) currentId = m[1];
    m = line.match(/title_zhCN:\s*"([^"]+)"/);
    if (m) {
      currentTitle = m[1];
      const norm = normalize(currentTitle);
      const exactMatch = rawTitles.find(r => r.title === currentTitle);
      if (exactMatch) {
        matchCount++;
        results.push({id: currentId, title: currentTitle, raw: exactMatch, matchType: "exact"});
      } else if (rawMap[norm]) {
        fuzzyCount++;
        results.push({id: currentId, title: currentTitle, raw: rawMap[norm], matchType: "fuzzy"});
      }
      currentId = "";
    }
  }
  
  return { results, matchCount, fuzzyCount };
}

const { results, matchCount, fuzzyCount } = matchProduct(ts, rawTitles);
console.log("Exact matches:", matchCount);
console.log("Fuzzy matches:", fuzzyCount);
console.log("Total:", matchCount + fuzzyCount);

// Print unmatched titles for analysis
if (matchCount + fuzzyCount < 191) {
  const matched = new Set(results.map(r => r.title));
  for (const line of ts) {
    const m = line.match(/title_zhCN:\s*"([^"]+)"/);
    if (m && !matched.has(m[1])) {
      console.log("UNMATCHED:", m[1].substring(0, 40));
    }
  }
}