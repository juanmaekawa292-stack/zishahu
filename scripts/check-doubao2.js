const WebSocket = require('ws');
const fs = require('fs');

const WS_URL = 'ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A';
const ws = new WebSocket(WS_URL);

let msgId = 1;
function send(method, params) {
    if (params === undefined) params = {};
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
    await send('Runtime.enable');

    // 检查页面中所有img标签
    var r1 = await send('Runtime.evaluate', {
        expression: '(function() { var imgs = document.querySelectorAll("img"); var results = []; for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; results.push({ i: i, w: img.width, h: img.height, natW: img.naturalWidth, natH: img.naturalHeight, srcLen: (img.src || "").length, alt: (img.alt || "").substring(0,50), cls: (img.className || "").substring(0,50), complete: img.complete }); } return JSON.stringify(results); })()',
        returnByValue: true
    });
    console.log('所有img标签:', r1.result.result.value);
    
    // 检查有没有canvas
    var r2 = await send('Runtime.evaluate', {
        expression: '(function() { var c = document.querySelectorAll("canvas"); return c.length + "个canvas"; })()',
        returnByValue: true
    });
    console.log('canvas数量:', r2.result.result.value);
    
    // 看看页面上最新的文本内容
    var r3 = await send('Runtime.evaluate', {
        expression: 'document.body.innerText.substring(document.body.innerText.length - 1000)',
        returnByValue: true
    });
    console.log('页面末尾文本:', r3.result.result.value);

    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
