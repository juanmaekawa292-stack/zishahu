
var fs = require('fs');

// 规格字段映射
var specKeyMap = {
  '烧制窑型': 'firingType',
  '容量': 'capacity',
  '主图来源': 'mainImageSource',
  '产地': 'origin',
  '是否手工': 'handmade',
  '材质': 'material',
  '壶型': 'shapeType',
  '包装形式': 'packaging',
  '窑系': 'kiln',
  '年代': 'year',
  '年代/年份': 'year',
  '颜色分类': 'color',
  '泥料': 'clay',
  '工艺': 'craft',
  '适用场景': 'scenario',
  '清洗方式': 'cleaning'
};

var content = fs.readFileSync('F:/codex-yunxing/zishahu/src/data/products.ts', 'utf8');

// 精确找到 products 数组范围
var prodMarker = 'export const products: Product[] = [';
var markerIdx = content.indexOf(prodMarker);
var arrStart = markerIdx + prodMarker.length - 1;
var depth = 1;
var i = arrStart + 1;
while (depth > 0 && i < content.length) {
  var c = content[i];
  if (c === '[') depth++;
  else if (c === ']') depth--;
  i++;
}
var arrEnd = i - 1;

// 提取数组并解析
var productsJSON = content.substring(arrStart, arrEnd + 1);
productsJSON = productsJSON.replace(/,(s*[\}\]])/g, '$1');
var products = JSON.parse(productsJSON);
console.log('Parsed ' + products.length + ' products');

// 建立 id 映射
var idMap = {};
products.forEach(function(p) {
  if (p.sourceUrl) {
    var m = p.sourceUrl.match(/id[=_](\d+)/);
    if (m) idMap[m[1]] = p;
  }
  if (p.sourceSku) idMap[p.sourceSku] = p;
});

// 扫描文件夹
var baseDirs = ['D:/图快下载器/淘宝采集/0615/', 'D:/图快下载器/淘宝采集/616/'];
var matched = 0;

baseDirs.forEach(function(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  var dirs = fs.readdirSync(baseDir).filter(function(d) { return fs.statSync(baseDir + d).isDirectory(); });
  
  dirs.forEach(function(dir) {
    var txtPath = baseDir + dir + '/页面数据.txt';
    if (!fs.existsSync(txtPath)) return;
    
    var txt = fs.readFileSync(txtPath, 'utf8');
    var title = txt.split('\n')[0].trim();
    
    var linkPath = baseDir + dir + '/商品链接.txt';
    var sourceUrl = '';
    if (fs.existsSync(linkPath)) sourceUrl = fs.readFileSync(linkPath, 'utf8').trim();
    
    var product = null;
    if (sourceUrl) {
      var m = sourceUrl.match(/id[=_](\d+)/);
      if (m && idMap[m[1]]) product = idMap[m[1]];
    }
    if (!product) product = products.find(function(p) { return p.title_zhCN === title || p.slug === title; });
    if (!product) product = products.find(function(p) { return p.slug && dir.indexOf(p.slug.substring(0, 10)) >= 0; });
    
    if (product) {
      matched++;
      var lines = txt.split('\n');
      var paramLine = '';
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('烧制窑型') >= 0 || (lines[i].indexOf('容量:') >= 0 && lines[i].indexOf('材质:') >= 0)) {
          paramLine = lines[i];
          break;
        }
      }
      
      if (paramLine) {
        product.specs = product.specs || {};
        Object.keys(specKeyMap).forEach(function(zhKey) {
          var engKey = specKeyMap[zhKey];
          var re = new RegExp(zhKey + '\\s*:\\s*([^;]+)');
          var m2 = paramLine.match(re);
          if (m2) {
            var val = m2[1].trim().replace(/[。，,;；]+$/, '').trim();
            if (val && val.length > 0) product.specs[engKey] = val;
          }
        });
      }
    }
  });
});

console.log('Matched: ' + matched);

// 统计
var specKeys = ['firingType','capacity','material','origin','handmade','shapeType','packaging','kiln','year','color','clay','craft','mainImageSource'];
specKeys.forEach(function(k) {
  var count = products.filter(function(p) { return p.specs && p.specs[k]; }).length;
  console.log('  ' + k + ': ' + count + '/' + products.length);
});

// specs 字段排序
var specOrder = ['firingType','capacity','mainImageSource','origin','handmade','material','shapeType','packaging','kiln','year','color','clay','craft','scenario','cleaning'];
products.forEach(function(p) {
  if (p.specs) {
    var ordered = {};
    specOrder.forEach(function(k) {
      if (p.specs[k] !== undefined) { ordered[k] = p.specs[k]; delete p.specs[k]; }
    });
    Object.keys(p.specs).forEach(function(k) { ordered[k] = p.specs[k]; });
    p.specs = ordered;
  }
});

// 重新序列化 products 数组 - 每行加2空格缩进
var newArr = JSON.stringify(products, null, 2);

// 替换原文件
var before = content.substring(0, arrStart);  // everything before [
var after = content.substring(arrEnd + 1);  // everything after ]

var newContent = before + newArr + after;

// 验证
var vi = newContent.indexOf('[');
var ve = newContent.indexOf('];\nexport');
if (ve < 0) ve = newContent.indexOf('];\n');
if (ve < 0) {
  console.log('ERROR: Cannot find ]; marker');
  console.log('Around arrEnd:', JSON.stringify(newContent.substring(arrEnd, arrEnd + 50)));
  process.exit(1);
}
var vs = newContent.substring(vi, ve + 1);
vs = vs.replace(/,(s*[\}\]])/g, '$1');
var vp = JSON.parse(vs);
console.log('\nVerified: ' + vp.length + ' products');
console.log('First specs:', JSON.stringify(vp[0].specs));

fs.writeFileSync('F:/codex-yunxing/zishahu/src/data/products.ts', newContent, 'utf8');
console.log('Written!');
