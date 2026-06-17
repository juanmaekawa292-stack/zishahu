const fs = require('fs');
const X = require('xlsx');

// Check existing products.ts IDs and sourceUrls
const p = fs.readFileSync('F:\\codex-yunxing\\zishahu\\src\\data\\products.ts', 'utf-8');
const idMatches = p.match(/id: "(tk-\d+)"/g);
const urlMatches = p.match(/sourceUrl: "([^"]+)"/g);
if (idMatches && urlMatches) {
  for (let i = 0; i < idMatches.length; i++) {
    const id = idMatches[i].replace('id: "','').replace('"','');
    const url = urlMatches[i].replace('sourceUrl: "','').replace('"','');
    console.log(id + ' URL: ' + url.substring(0,80));
  }
}
console.log('---');

// Check 0615 folder structure
const dir0615 = 'D:\\图快下载器\\淘宝采集\\0615\\';
const folders0615 = fs.readdirSync(dir0615).filter(f => f.startsWith('00_'));
folders0615.forEach(f => {
  const xlsxFiles = fs.readdirSync(dir0615+f).filter(x => x.endsWith('.xlsx'));
  if (xlsxFiles.length === 0) { console.log(f.substring(0,40)+': NO XLSX'); return; }
  const wb = X.readFile(dir0615+f+'\\\\'+xlsxFiles[0]);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = X.utils.sheet_to_json(ws, {header:1});
  // Check if column 11 exists
  const col11 = data[1] ? String(data[1][11] || '') : '';
  const header0 = String(data[0]?.[0] || '');
  const rows = data.length;
  const files = fs.readdirSync(dir0615+f);
  const mains = files.filter(x => x.startsWith('\u4e3b\u56fe')).length;
  const details = files.filter(x => x.startsWith('\u8be6\u60c5')).length;
  const videos = files.filter(x => x.startsWith('\u89c6\u9891') || x.endsWith('.mp4')).length;
  console.log(f.substring(0,35)+' rows='+rows+' h0='+header0.substring(0,15)+' mains='+mains+' det='+details+' vids='+videos);
  if (col11) console.log('  col11='+col11.substring(0,70));
});
