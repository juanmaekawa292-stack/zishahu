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
      if (msg.id === id) {
        ws.removeListener("message", handler);
        resolve(msg);
      }
    };
    ws.on("message", handler);
  });
}

async function run() {
  await send("Page.enable");
  await send("Runtime.enable");

  var btnResult = await send("Runtime.evaluate", {
    expression: '(function() { var els = document.querySelectorAll("*"); var res = []; for (var i = 0; i < els.length; i++) { var el = els[i]; var text = (el.textContent || "").trim(); var cls = (el.className || ""); var rect = el.getBoundingClientRect(); if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) { var ariaLabel = el.getAttribute("aria-label") || ""; if (ariaLabel.indexOf("上传") >= 0 || ariaLabel.indexOf("附件") >= 0 || ariaLabel.indexOf("图片") >= 0 || text.indexOf("上传") >= 0) { res.push({ tag: el.tagName, text: text.substring(0,30), cls: cls.substring(0,40), ariaLabel: ariaLabel.substring(0,40), r: { t:Math.round(rect.top), l:Math.round(rect.left), w:Math.round(rect.width), h:Math.round(rect.height) } }); } } } return JSON.stringify(res); })()',
    returnByValue: true
  });

  var info = JSON.parse(btnResult.result.result.value);
  console.log("找到", info.length, "个上传相关元素:");
  for (var i = 0; i < info.length; i++) {
    console.log("  " + JSON.stringify(info[i]));
  }

  // 截图
  var shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  fs.writeFileSync("doubao_ui.jpg", Buffer.from(shot.result.data, "base64"));
  console.log("截图已保存: doubao_ui.jpg");

  ws.close();
}

ws.on("open", run);
ws.on("error", function(e) { console.error("Error:", e.message); });
