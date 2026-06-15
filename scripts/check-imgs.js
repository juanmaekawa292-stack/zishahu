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
  var r = await send("Runtime.evaluate", {
    expression: '(function() { var imgs = document.querySelectorAll("img"); var res = []; for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; var src = img.src || ""; res.push({ idx: i, w: img.naturalWidth, h: img.naturalHeight, srcLen: src.length, srcStart: src.substring(0,40), complete: img.complete }); } return JSON.stringify(res); })()',
    returnByValue: true
  });
  console.log(r.result.result.value);
  ws.close();
}
ws.on("open", run);
ws.on("error", function(e) { console.error(e.message); });
