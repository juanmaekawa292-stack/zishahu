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
    
    // 列出所有img的详细信息
    var r = await send('Runtime.evaluate', {
        expression: '(function() { var imgs = document.querySelectorAll("img"); var results = []; for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; results.push({ i: i, w: img.naturalWidth, h: img.naturalHeight, src: (img.src || "").substring(0, 120), complete: img.complete, visible: img.offsetWidth > 0 && img.offsetHeight > 0 }); } return JSON.stringify(results); })()',
        returnByValue: true
    });
    var imgs = JSON.parse(r.result.result.value);
    console.log('所有图片:');
    imgs.forEach(function(img) {
        console.log('  [' + img.i + '] ' + img.w + 'x' + img.h + ' visible:' + img.visible + ' complete:' + img.complete + ' src:' + img.src);
    });
    
    // 检查index 7和4、6的src
    for (var idx = 0; idx < imgs.length; idx++) {
        if (imgs[idx].w > 400 && imgs[idx].h > 400) {
            var srcResult = await send('Runtime.evaluate', {
                expression: 'document.querySelectorAll("img")[' + idx + '].src',
                returnByValue: true
            });
            var src = srcResult.result.result.value;
            console.log('图[' + idx + '] 完整src长度:', src.length, '是base64:', src.indexOf('data:') === 0);
            
            if (src.indexOf('data:image') === 0) {
                var commaIdx = src.indexOf(',');
                var base64Data = src.substring(commaIdx + 1);
                var imgBuffer = Buffer.from(base64Data, 'base64');
                
                var targetPath = 'D:\\图快下载器\\淘宝采集\\00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶\\主图_1.jpg';
                if (!fs.existsSync(targetPath.replace('主图_1.jpg', '主图_1_原始备份.jpg'))) {
                    fs.copyFileSync(targetPath, targetPath.replace('主图_1.jpg', '主图_1_原始备份.jpg'));
                }
                fs.writeFileSync(targetPath, imgBuffer);
                console.log('✅ 已覆盖主图_1.jpg! 大小:', imgBuffer.length, 'bytes');
            }
        }
    }
    
    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
