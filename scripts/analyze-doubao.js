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

  // 先清空已存在的对话内容，点新建对话
  // 找到"新对话"按钮
  var newChatResult = await send("Runtime.evaluate", {
    expression: '(function() { var els = document.querySelectorAll("*"); for (var i = 0; i < els.length; i++) { var el = els[i]; if ((el.textContent || "").trim().indexOf("新对话") >= 0 && el.offsetWidth > 0 && el.offsetHeight > 0) { return el.tagName + " " + el.className.substring(0,80) + " [" + Math.round(el.getBoundingClientRect().left) + "," + Math.round(el.getBoundingClientRect().top) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height) + "]"; } } return "not found"; })()',
    returnByValue: true
  });
  console.log("新对话按钮:", newChatResult.result.result.value);

  // 找所有可点击元素来分析UI布局 - 靠近顶部的sidebar元素
  var sidebarResult = await send("Runtime.evaluate", {
    expression: '(function() { var els = document.querySelectorAll("[class*=sidebar], [class*=Sidebar], [class*=menu], [class*=Menu], nav, aside"); var res = []; for (var i = 0; i < els.length; i++) { var el = els[i]; var r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) { res.push({ tag: el.tagName, cls: (el.className || "").substring(0,60), r: { l:Math.round(r.left), t:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height) } }); } } return JSON.stringify(res); })()',
    returnByValue: true
  });
  console.log("侧边栏元素:", sidebarResult.result.result.value);

  // 找到所有带text的左上角按钮/图标
  var topBarResult = await send("Runtime.evaluate", {
    expression: '(function() { var all = document.querySelectorAll("*"); var res = []; for (var i = 0; i < all.length; i++) { var el = all[i]; var r = el.getBoundingClientRect(); if (r.top < 60 && r.left >= 0 && r.left < 100 && r.width > 20 && r.height > 20) { res.push({ tag: el.tagName, text: (el.textContent||"").trim().substring(0,20), r: { l:Math.round(r.left), t:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height) } }); } } return JSON.stringify(res); })()',
    returnByValue: true
  });
  console.log("顶部按钮:", topBarResult.result.result.value);

  ws.close();
}

ws.on("open", run);
ws.on("error", function(e) { console.error("Error:", e.message); });
