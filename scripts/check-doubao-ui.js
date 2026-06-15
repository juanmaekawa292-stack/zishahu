const WebSocket = require("ws");
const fs = require("fs");

const WS_URL = "ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A";
const ws = new WebSocket(WS_URL);

let msgId = 1;
function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = msgId++;
    ws.send(JSON.stringify({ id, method, params }));
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) { ws.removeListener("message", handler); resolve(msg); }
    };
    ws.on("message", handler);
  });
}

async function run() {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");

  // 看textarea的属性
  const taInfo = await send("Runtime.evaluate", {
    expression: `(function() {
      var ta = document.querySelector("textarea");
      var rect = ta.getBoundingClientRect();
      var placeholder = ta.placeholder || "";
      var parent = ta.parentElement;
      return JSON.stringify({
        tag: ta.tagName,
        rect: { top: rect.top, left: rect.left, w: rect.width, h: rect.height },
        placeholder: placeholder,
        parentTag: parent ? parent.tagName : "",
        parentClass: parent ? (parent.className || "").substring(0,100) : ""
      });
    })()`,
    returnByValue: true
  });
  console.log("textarea:", taInfo.result.result.value);

  // 看file input
  const fileInfo = await send("Runtime.evaluate", {
    expression: `(function() {
      var fi = document.querySelector("input[type=file]");
      if (!fi) return "null";
      var rect = fi.getBoundingClientRect();
      return JSON.stringify({
        rect: { top: rect.top, left: rect.left, w: rect.width, h: rect.height },
        parentTag: fi.parentElement ? fi.parentElement.tagName : "",
        display: getComputedStyle(fi).display,
        visibility: getComputedStyle(fi).visibility
      });
    })()`,
    returnByValue: true
  });
  console.log("file input:", fileInfo.result.result.value);

  // 看发送按钮
  const btnInfo = await send("Runtime.evaluate", {
    expression: `(function() {
      var buttons = document.querySelectorAll("button");
      var results = [];
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        var txt = (b.textContent || "").trim().substring(0, 20);
        var rect = b.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          results.push({ idx: i, text: txt, w: Math.round(rect.width), h: Math.round(rect.height), top: Math.round(rect.top), left: Math.round(rect.left) });
        }
      }
      return JSON.stringify(results);
    })()`,
    returnByValue: true
  });
  console.log("buttons:", btnInfo.result.result.value);

  // 看页面可见文本（关键区域）
  const textResult = await send("Runtime.evaluate", {
    expression: "document.querySelector('main') ? document.querySelector('main').innerText.substring(0, 2000) : document.body.innerText.substring(0, 2000)",
    returnByValue: true
  });
  console.log("\n--- 页面文本 ---\n" + textResult.result.result.value);

  ws.close();
}

ws.on("open", run);
ws.on("error", (e) => console.error("Error:", e.message));
