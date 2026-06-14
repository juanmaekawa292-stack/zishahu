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

    console.log('查找生成好的大图...');

    const imgResult = await send('Runtime.evaluate', {
        expression: '(function() { var imgs = document.querySelectorAll("img"); var results = []; for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; var src = img.src || ""; var rect = img.getBoundingClientRect(); if (rect.width > 200 && rect.height > 200 && src.length > 100) { results.push({ index: i, width: Math.round(rect.width), height: Math.round(rect.height), srcLength: src.length, isBase64: src.indexOf("data:") === 0 }); } } return JSON.stringify(results); })()',
        returnByValue: true
    });
    
    var imgs = JSON.parse(imgResult.result.result.value);
    console.log('检测到大图数量:', imgs.length);

    if (imgs.length > 0) {
        var lastIdx = imgs[imgs.length - 1].index;
        console.log('获取第' + lastIdx + '张图的完整数据...');
        
        var fullImgResult = await send('Runtime.evaluate', {
            expression: '(function() { var imgs = document.querySelectorAll("img"); return imgs[' + lastIdx + '].src; })()',
            returnByValue: true
        });
        
        var dataUrl = fullImgResult.result.result.value;
        console.log('图片数据长度:', dataUrl.length);
        
        if (dataUrl.indexOf('data:image') === 0) {
            var commaIdx = dataUrl.indexOf(',');
            var base64Data = dataUrl.substring(commaIdx + 1);
            var mimePart = dataUrl.substring(0, commaIdx);
            console.log('MIME:', mimePart);
            
            var imgBuffer = Buffer.from(base64Data, 'base64');
            
            var targetPath = 'D:\\图快下载器\\淘宝采集\\00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶\\主图_1.jpg';
            var backupPath = 'D:\\图快下载器\\淘宝采集\\00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶\\主图_1_原始备份.jpg';
            
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(targetPath, backupPath);
                console.log('已备份原图');
            }
            
            fs.writeFileSync(targetPath, imgBuffer);
            console.log('✅ 已覆盖原图! 大小:', imgBuffer.length, 'bytes');
            fs.writeFileSync('temp_zhutu1_new.jpg', imgBuffer);
            console.log('✅ 项目目录也保存了一份');
        } else {
            console.log('不是base64图片:', dataUrl.substring(0, 100));
        }
    }

    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
