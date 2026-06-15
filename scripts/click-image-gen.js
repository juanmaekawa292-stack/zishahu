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
async function run() {
  await send("Page.enable");
  await send("Runtime.enable");

  // 点击"图像生成"
  var clickResult = await send("Runtime.evaluate", {
    expression: '(function() { var btns = document.querySelectorAll("button"); for (var i = 0; i < btns.length; i++) { var txt = (btns[i].textContent||"").trim(); if (txt.indexOf("图像生成") >= 0) { btns[i].click(); return "点击了: " + txt; } } return "未找到图像生成按钮"; })()',
    returnByValue: true
  });
  console.log("点击结果:", clickResult.result.result.value);

  // 等待页面切换
  await new Promise(function(r) { setTimeout(r, 3000); });

  // 看看当前URL
  var url = await send("Runtime.evaluate", { expression: "window.location.href", returnByValue: true });
  console.log("当前URL:", url.result.result.value);

  // 截图
  var shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  fs.writeFileSync("doubao_image_gen2.jpg", Buffer.from(shot.result.data, "base64"));
  console.log("截图已保存");

  ws.close();
}
ws.on("open", run);
ws.on("error", function(e) { console.error(e.message); });
