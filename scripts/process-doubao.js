const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const WS_URL = 'ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A';
const ws = new WebSocket(WS_URL);

let msgId = 1;
function send(method, params = {}) {
    return new Promise((resolve) => {
        const id = msgId++;
        ws.send(JSON.stringify({ id, method, params }));
        const handler = (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.id === id) {
                ws.removeListener('message', handler);
                resolve(msg);
            }
        };
        ws.on('message', handler);
    });
}

async function run() {
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    // 检查页面主要元素
    const checks = [
        'document.querySelector("textarea") !== null',
        'document.querySelector("input[type=file]") !== null',
        'document.querySelector("[contenteditable]") !== null',
        'document.querySelector("div[contenteditable]") !== null',
        'document.querySelector(".ql-editor") !== null',
        'document.querySelector("[role=textbox]") !== null'
    ];
    
    for (const expr of checks) {
        const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
        console.log(expr, '=>', r.result.result.value);
    }

    // 获取页面部分可见文本
    const textResult = await send('Runtime.evaluate', {
        expression: 'document.body.innerText.substring(0, 2000)',
        returnByValue: true
    });
    console.log('\n---页面文本 (前2000字符)---');
    console.log(textResult.result.result.value);
    
    ws.close();
}

ws.on('open', run);
ws.on('error', console.error);
