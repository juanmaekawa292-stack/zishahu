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

  // 1. 点击左侧"豆包"新建对话
  var newChat = await send("Runtime.evaluate", {
    expression: '(function() { var els = document.querySelectorAll("a, div, button"); for (var i = 0; i < els.length; i++) { var txt = (els[i].textContent||"").trim(); if (txt === "豆包" && els[i].offsetWidth > 0) { els[i].click(); return "clicked 豆包"; } } return "not found"; })()',
    returnByValue: true
  });
  console.log(newChat.result.result.value);
  await new Promise(function(r) { setTimeout(r, 2000); });

  // 2. 点击"图像生成"
  var imgGen = await send("Runtime.evaluate", {
    expression: '(function() { var btns = document.querySelectorAll("button"); for (var i = 0; i < btns.length; i++) { var txt = (btns[i].textContent||"").trim(); if (txt.indexOf("图像生成") >= 0) { btns[i].click(); return "clicked 图像生成"; } } return "not found"; })()',
    returnByValue: true
  });
  console.log(imgGen.result.result.value);
  await new Promise(function(r) { setTimeout(r, 3000); });

  // 3. 截图看新页面
  var shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  fs.writeFileSync("doubao_img_gen.jpg", Buffer.from(shot.result.data, "base64"));
  console.log("截图已保存");

  // 4. 看看有没有file input
  var fi = await send("Runtime.evaluate", {
    expression: '!!document.querySelector("input[type=file]")',
    returnByValue: true
  });
  console.log("有file input:", fi.result.result.value);

  ws.close();
}
ws.on("open", run);
ws.on("error", function(e) { console.error(e.message); });
