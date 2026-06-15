const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const WS_URL = "ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A";
const ws = new WebSocket(WS_URL);
let msgId = 1;

function send(method, params) {
  if (params === undefined) params = {};
  return new Promise(function(resolve) {
    var id = msgId++;
    ws.send(JSON.stringify({ id: id, method: method, params: params }));
    var handler = function(data) {
      var msg = JSON.parse(data.toString());
      if (msg.id === id) { ws.removeListener("message", handler); resolve(msg); }
    };
    ws.on("message", handler);
  });
}

// 需要处理的有水印主图（12张）
var products = [
  { dir: "00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶", files: ["主图_1.jpg", "主图_4.jpg"] },
  { dir: "00_大容量430ml西施壶描金紫砂壶茶杯一壶二四杯礼盒装企业礼品定制", files: ["主图_1.jpg", "主图_3.jpg", "主图_4.jpg"] },
  { dir: "00_戴晨光宜兴纯手工紫砂壶原矿老紫泥紫砂茶具家用泡茶西施壶220ml", files: ["主图_1.jpg", "主图_3.jpg"] },
  { dir: "00_百年利永 宜兴原矿紫砂壶纯手工泡茶壶功夫茶具套装底槽青仿古壶", files: ["主图_1.jpg", "主图_2.jpg", "主图_3.jpg", "主图_4.jpg"] },
  { dir: "00_颐壶春宜兴紫砂壶纯手工家用泡茶壶全手工功夫茶具原矿紫泥汉瓦壶", files: ["主图_1.jpg"] }
];

var BASE_SRC = "D:\\图快下载器\\淘宝采集\\0615";
var BASE_OUT = "D:\\图快下载器\\P图成品";

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

async function processOneImage(imgPath, outPath, fileName) {
  console.log("--- 处理: " + fileName + " ---");

  // 1. 点击"图像生成"按钮
  await sleep(2000);
  var btnResult = await send("Runtime.evaluate", {
    expression: '(function() { var btns = document.querySelectorAll("button"); for (var i = 0; i < btns.length; i++) { var txt = (btns[i].textContent||"").trim(); if (txt.indexOf("图像生成") >= 0) { btns[i].click(); return "clicked"; } } return "not found"; })()',
    returnByValue: true
  });
  console.log("点击图像生成:", btnResult.result.result.value);
  await sleep(3000);

  // 2. 找file input上传图片
  var docResult = await send("DOM.getDocument", { depth: -1 });
  var rootId = docResult.result.root.nodeId;
  var fiResult = await send("DOM.querySelector", { nodeId: rootId, selector: "input[type=file]" });

  if (fiResult.result.nodeId) {
    await send("DOM.setFileInputFiles", { nodeId: fiResult.result.nodeId, files: [imgPath] });
    console.log("  图片已上传");
    await sleep(3000);

    // 3. 输入指令
    var textResult = await send("Runtime.evaluate", {
      expression: '(function() { var ta = document.querySelector("textarea"); if (!ta) return "no textarea"; var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set; setter.call(ta, "去掉这张商品图底部的水印文字（左下角店铺名、右下角天猫/淘宝Logo），保留图片其他部分不变，保持原图比例"); ta.dispatchEvent(new Event("input", { bubbles: true })); ta.dispatchEvent(new Event("change", { bubbles: true })); return "input done"; })()',
      returnByValue: true
    });
    console.log("  输入指令:", textResult.result.result.value);
    await sleep(1000);

    // 4. 点击发送按钮（输入框右边的那个）
    var sendResult = await send("Runtime.evaluate", {
      expression: '(function() { var btns = document.querySelectorAll("button"); for (var i = 0; i < btns.length; i++) { var r = btns[i].getBoundingClientRect(); if (r.top > 800 && r.left > 300 && r.left < 400 && r.width > 30 && r.height > 30) { btns[i].click(); return "clicked at " + Math.round(r.left) + "," + Math.round(r.top); } } return "not found"; })()',
      returnByValue: true
    });
    console.log("  发送:", sendResult.result.result.value);

    // 5. 等待生成并下载
    console.log("  等待处理结果...");
    for (var t = 1; t <= 60; t++) {
      var imgResult = await send("Runtime.evaluate", {
        expression: '(function() { var imgs = document.querySelectorAll("img"); for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; var src = img.src || ""; if (img.naturalWidth > 400 && img.naturalHeight > 400 && img.complete && src.length > 1000 && src.indexOf("data:image/svg") !== 0) { return JSON.stringify({ found: true, idx: i, w: img.naturalWidth, h: img.naturalHeight }); } } return JSON.stringify({ found: false }); })()',
        returnByValue: true
      });
      var info = JSON.parse(imgResult.result.result.value);

      if (info.found) {
        console.log("  检测到大图! [" + info.w + "x" + info.h + "]");

        var fullSrc = await send("Runtime.evaluate", {
          expression: "document.querySelectorAll('img')[" + info.idx + "].src",
          returnByValue: true
        });
        var dataUrl = fullSrc.result.result.value;
        console.log("  数据长度:", dataUrl.length);

        // 保存
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        var targetPath = path.join(outDir, fileName);

        if (dataUrl.indexOf("data:image") === 0) {
          var commaIdx = dataUrl.indexOf(",");
          var base64Data = dataUrl.substring(commaIdx + 1);
          var buf = Buffer.from(base64Data, "base64");
          fs.writeFileSync(targetPath, buf);
          console.log("  ✅ 已保存! (" + buf.length + " bytes)");
        } else if (dataUrl.indexOf("http") === 0 || dataUrl.indexOf("blob:") === 0) {
          // HTTP/Blob图片 - 需要另外处理
          console.log("  HTTP/blob图片, 需要再处理");
          // 尝试用fetch获取
          var fetchResult = await send("Runtime.evaluate", {
            expression: '(async function() { try { var resp = await fetch("' + dataUrl + '"); var blob = await resp.blob(); var reader = new FileReader(); return new Promise(function(res) { reader.onload = function() { res(reader.result); }; reader.readAsDataURL(blob); }); } catch(e) { return "error:" + e.message; } })()',
            awaitPromise: true,
            returnByValue: true
          });
          if (fetchResult.result && fetchResult.result.result && fetchResult.result.result.value.indexOf("data:image") === 0) {
            var commaIdx = fetchResult.result.result.value.indexOf(",");
            var base64Data = fetchResult.result.result.value.substring(commaIdx + 1);
            var buf = Buffer.from(base64Data, "base64");
            fs.writeFileSync(targetPath, buf);
            console.log("  ✅ 已保存(通过fetch)! (" + buf.length + " bytes)");
          }
        }
        return true;
      }

      await sleep(3000);
      if (t % 10 === 0) console.log("  ...等待中 (" + (t*3) + "s)");
    }

    console.log("  超时，未获取到结果");
  }
  return false;
}

async function run() {
  console.log("连接豆包页面...");
  await send("Page.enable");
  await send("DOM.enable");
  await send("Runtime.enable");

  // 先看看页面状态
  var title = await send("Runtime.evaluate", { expression: "document.title", returnByValue: true });
  console.log("页面:", title.result.result.value);

  // 处理每个商品
  for (var p = 0; p < products.length; p++) {
    var product = products[p];
    var outDir = path.join(BASE_OUT, product.dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (var f = 0; f < product.files.length; f++) {
      var fileName = product.files[f];
      var imgPath = path.join(BASE_SRC, product.dir, fileName);
      if (!fs.existsSync(imgPath)) {
        console.log("文件不存在:", imgPath);
        continue;
      }
      await processOneImage(imgPath, outDir, fileName);
      await sleep(2000);
    }
  }

  console.log("\\n全部处理完成!");
  ws.close();
}

ws.on("open", run);
ws.on("error", function(e) { console.error("错误:", e.message); });
