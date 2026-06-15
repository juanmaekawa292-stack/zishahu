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

  // 检查页面状态
  const r1 = await send("Runtime.evaluate", { expression: "document.title", returnByValue: true });
  console.log("页面标题:", r1.result.result.value);

  // 检查textarea和file input
  const checks = [
    '!!document.querySelector("textarea")',
    '!!document.querySelector("input[type=file]")',
    '!!document.querySelector("[contenteditable]")',
    '!!document.querySelector("[role=textbox]")'
  ];
  for (const expr of checks) {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    console.log(expr, "=>", r.result.result.value);
  }

  // 截图
  const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  fs.writeFileSync("doubao_state.jpg", Buffer.from(shot.result.data, "base64"));
  console.log("截图已保存: doubao_state.jpg");

  ws.close();
}

ws.on("open", run);
ws.on("error", (e) => console.error("WS Error:", e.message));
