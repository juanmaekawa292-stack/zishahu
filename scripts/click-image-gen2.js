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

  // 直接通过点击坐标来点击"图像生成"按钮（按钮在底部，根据截图位置大致在 x=459, y=865）
  // 先点一下输入框上方的区域让按钮可见
  // 用XPath/selector找到文本为"图像生成"的元素并点击
  var clickResult = await send("Runtime.evaluate", {
    expression: '(function() { var all = document.querySelectorAll("button, div, span, a"); for (var i = 0; i < all.length; i++) { var el = all[i]; if ((el.textContent||"").trim() === "图像生成" && el.offsetWidth > 0) { el.click(); return "点击成功: " + el.tagName + " " + (el.className||"").substring(0,40); } } return "未找到"; })()',
    returnByValue: true
  });
  console.log("点击结果:", clickResult.result.result.value);

  await new Promise(function(r) { setTimeout(r, 2000); });

  // 截图
  var shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  fs.writeFileSync("doubao_after_click.jpg", Buffer.from(shot.result.data, "base64"));
  console.log("截图已保存");

  // 看看当前页面有哪些可交互元素
  var html = await send("Runtime.evaluate", {
    expression: 'document.querySelector("textarea") ? "有textarea" : "无textarea"',
    returnByValue: true
  });
  console.log(html.result.result.value);

  ws.close();
}
ws.on("open", run);
ws.on("error", function(e) { console.error(e.message); });
