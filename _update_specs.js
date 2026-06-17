
var fs = require('fs');
var path = require('path');

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

// 读取 products.ts
var content = fs.readFileSync('F:/codex-yunxing/zishahu/src/data/products.ts', 'utf8');

// 解析 products 数组
var prodMarker = 'export const products: Product[] = [';
var prodStart = content.indexOf(prodMarker) + prodMarker.length - 1;
var catStart = content.indexOf('export const categories');
var searchZone = content.substring(prodStart, catStart);
var closing = searchZone.lastIndexOf('];');
var jsonStr = searchZone.substring(0, closing + 1);
jsonStr = jsonStr.replace(/,(s*[}\]]])/g, '$1');
var products = JSON.parse(jsonStr);
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
var updated = 0;

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
    
    // 匹配
    var product = null;
    if (sourceUrl) {
      var m = sourceUrl.match(/id[=_](\d+)/);
      if (m && idMap[m[1]]) product = idMap[m[1]];
    }
    if (!product) product = products.find(function(p) { return p.title_zhCN === title || p.slug === title; });
    if (!product) product = products.find(function(p) { return p.slug && dir.indexOf(p.slug.substring(0, 10)) >= 0; });
    
    if (product) {
      matched++;
      
      // 找参数行
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
        updated++;
      }
    }
  });
});

console.log('Matched: ' + matched + ', Updated: ' + updated);

// 统计
var specKeys = ['firingType','capacity','material','origin','handmade','shapeType','packaging','kiln','year','color','clay','craft','mainImageSource'];
specKeys.forEach(function(k) {
  var count = products.filter(function(p) { return p.specs && p.specs[k]; }).length;
  console.log('  ' + k + ': ' + count + '/' + products.length);
});

// 对每个商品按顺序排列 specs 字段
var specOrder = ['firingType','capacity','mainImageSource','origin','handmade','material','shapeType','packaging','kiln','year','color','clay','craft','scenario','cleaning'];
products.forEach(function(p) {
  if (p.specs) {
    var ordered = {};
    specOrder.forEach(function(k) {
      if (p.specs[k] !== undefined) {
        ordered[k] = p.specs[k];
        delete p.specs[k];
      }
    });
    Object.keys(p.specs).forEach(function(k) { ordered[k] = p.specs[k]; });
    p.specs = ordered;
  }
});

// 序列化为 JSON，保持原格式
var productsJSON = JSON.stringify(products, null, 2);

// 替换原文件中的 products 数组
var before = content.substring(0, prodStart + 1);
var after = content.substring(prodStart + closing + 2);
var newContent = before + '\n' + productsJSON.substring(1, productsJSON.length - 1) + '\n' + after;

// 验证
try {
  // 找到数组起始
  var vi = newContent.indexOf('[');
  var ve = newContent.indexOf('];\nexport');
  var vs = newContent.substring(vi, ve + 1);
  vs = vs.replace(/,(s*[}\]]])/g, '$1');
  var vp = JSON.parse(vs);
  console.log('\nVerified: ' + vp.length + ' products');
  console.log('First specs:', JSON.stringify(vp[0].specs));
} catch(e) {
  console.log('Verify error:', e.message.substring(0, 150));
  console.log('Around error:', JSON.stringify(newContent.substring(newContent.indexOf('];') - 100, newContent.indexOf('];') + 20)));
  process.exit(1);
}

// 写文件
fs.writeFileSync('F:/codex-yunxing/zishahu/src/data/products.ts', newContent, 'utf8');
console.log('\nWritten successfully!');
