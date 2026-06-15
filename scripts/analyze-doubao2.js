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

  // 1. 点击左上角的"豆包"按钮（前往新对话，避免历史内容干扰）
  // 先检查当前页面的URL
  var urlResult = await send("Runtime.evaluate", {
    expression: "window.location.href",
    returnByValue: true
  });
  console.log("当前URL:", urlResult.result.result.value);

  // 2. 检查textarea
  var taResult = await send("Runtime.evaluate", {
    expression: "document.querySelector(\\\"textarea\\\") !== null",
    returnByValue: true
  });
  console.log("有textarea:", taResult.result.result.value);

  // 3. 检查file input的父元素——找到触发上传的按钮
  // file input是hidden的，需要找到触发它的按钮
  var uploadBtnResult = await send("Runtime.evaluate", {
    expression: '(function() {
      // 找到file input
      var fi = document.querySelector("input[type=file]");
      if (!fi) return "no file input";

      // 在fi附近找一个可点击的元素
      var parent = fi.parentElement;
      var rect = fi.getBoundingClientRect();

      // 在文档中找aria-label或title包含上传/图片的元素
      var all = document.querySelectorAll("[aria-label*=\\"上传\\"], [aria-label*=\\"图片\\"], [title*=\\"上传\\"], [title*=\\"图片\\"]");
      var results = [];
      for (var i = 0; i < all.length; i++) {
        var r = all[i].getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          results.push({ tag: all[i].tagName, text: (all[i].textContent||"").trim().substring(0,20), r: {t:Math.round(r.top), l:Math.round(r.left), w:Math.round(r.width), h:Math.round(r.height)} });
        }
      }
      return JSON.stringify({ fiRect: {t:Math.round(rect.top),l:Math.round(rect.left),w:Math.round(rect.width),h:Math.round(rect.height)}, parentTag: parent.tagName, uploadButtons: results });
    })()',
    returnByValue: true
  });
  console.log("上传按钮信息:", uploadBtnResult.result.result.value);

  // 4. 看输入框附近的所有图标按钮
  var inputAreaResult = await send("Runtime.evaluate", {
    expression: '(function() {
      var ta = document.querySelector("textarea");
      if (!ta) return "no textarea";
      var taRect = ta.getBoundingClientRect();
      // 输入框就在底部区域，找附近的所有按钮
      var all = document.querySelectorAll("button");
      var near = [];
      for (var i = 0; i < all.length; i++) {
        var r = all[i].getBoundingClientRect();
        // 输入框附近: 左右80px，上下50px
        if (Math.abs(r.bottom - taRect.bottom) < 80 || Math.abs(r.top - taRect.top) < 80) {
          near.push({ idx: i, tag: all[i].tagName, text: (all[i].textContent||"").trim().substring(0,15), r: {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)} });
        }
      }
      return JSON.stringify(near);
    })()',
    returnByValue: true
  });
  console.log("输入框附近按钮:", inputAreaResult.result.result.value);

  ws.close();
}

ws.on("open", run);
ws.on("error", function(e) { console.error("Error:", e.message); });
