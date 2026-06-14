const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

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

function download(url, outputPath) {
    return new Promise((resolve, reject) => {
        https.get(url, function(res) {
            var chunks = [];
            res.on('data', function(chunk) { chunks.push(chunk); });
            res.on('end', function() {
                var buffer = Buffer.concat(chunks);
                fs.writeFileSync(outputPath, buffer);
                resolve(buffer.length);
            });
        }).on('error', reject);
    });
}

async function run() {
    await send('Page.enable');
    await send('Runtime.enable');
    
    // 获取图[8]和图[11]的完整URL（豆包生成的图片）
    for (var idx of [8, 11]) {
        var r = await send('Runtime.evaluate', {
            expression: 'document.querySelectorAll("img")[' + idx + '].src',
            returnByValue: true
        });
        var url = r.result.result.value;
        console.log('图[' + idx + '] URL:', url);
        
        if (url && url.indexOf('http') === 0 && url.indexOf('imagex') > 0) {
            var outPath = 'doubao_gen_' + idx + '.jpg';
            var size = await download(url, outPath);
            console.log('下载完成:', outPath, size, 'bytes');
        }
    }
    
    // 也检查一下blob: URL的图[9]能否获取到数据
    var r3 = await send('Runtime.evaluate', {
        expression: '(async function() { var imgs = document.querySelectorAll(\"img\"); var img = imgs[9]; var canvas = document.createElement(\"canvas\"); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; var ctx = canvas.getContext(\"2d\"); ctx.drawImage(img, 0, 0); return canvas.toDataURL(\"image/jpeg\", 0.95); })()',
        returnByValue: true,
        awaitPromise: true
    });
    var dataUrl = r3.result.result.value;
    console.log('图[9] canvas获取, 长度:', dataUrl.length);
    
    if (dataUrl && dataUrl.indexOf('data:image') === 0) {
        var commaIdx = dataUrl.indexOf(',');
        var base64Data = dataUrl.substring(commaIdx + 1);
        var imgBuffer = Buffer.from(base64Data, 'base64');
        
        var targetPath = 'D:\\图快下载器\\淘宝采集\\00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶\\主图_1.jpg';
        var backupPath = targetPath.replace('主图_1.jpg', '主图_1_原始备份.jpg');
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(targetPath, backupPath);
        }
        fs.writeFileSync(targetPath, imgBuffer);
        console.log('✅ 已覆盖主图_1.jpg! 大小:', imgBuffer.length, 'bytes');
    }
    
    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
