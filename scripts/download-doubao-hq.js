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
    
    // 找最大的可交互图片（豆包生成的图）
    var r = await send('Runtime.evaluate', {
        expression: '(function() { var imgs = document.querySelectorAll(\"img\"); var best = null; for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; if (img.complete && img.naturalWidth > 200 && img.naturalHeight > 200 && img.offsetWidth > 0 && img.offsetHeight > 0) { var src = img.src || \"\"; if (src.indexOf(\"http\") === 0 && src.indexOf(\"imagex\") > 0) { if (!best || (img.naturalWidth * img.naturalHeight > best.w * best.h)) { best = { idx: i, w: img.naturalWidth, h: img.naturalHeight, src: src.substring(0, 100) }; } } } } return JSON.stringify(best); })()',
        returnByValue: true
    });
    console.log('最佳图片:', r.result.result.value);
    
    var info = JSON.parse(r.result.result.value);
    if (info && info.src) {
        // 拿到完整URL
        var fullSrc = await send('Runtime.evaluate', {
            expression: 'document.querySelectorAll(\"img\")[' + info.idx + '].src',
            returnByValue: true
        });
        var fullUrl = fullSrc.result.result.value;
        console.log('完整URL:', fullUrl);
        
        // 下载图片
        var https = require('https');
        https.get(fullUrl, function(res) {
            var chunks = [];
            res.on('data', function(c) { chunks.push(c); });
            res.on('end', function() {
                var buf = Buffer.concat(chunks);
                var targetPath = 'D:\\图快下载器\\淘宝采集\\00_古悦堂宜兴紫砂壶纯全手工茶壶功夫茶具套装家用泡茶壶经典石瓢壶\\主图_1.jpg';
                var backupPath = targetPath.replace('主图_1.jpg', '主图_1_原始备份.jpg');
                if (!fs.existsSync(backupPath)) {
                    fs.copyFileSync(targetPath, backupPath);
                    console.log('已备份原图');
                }
                fs.writeFileSync(targetPath, buf);
                console.log('✅ 已覆盖原图! 大小:', buf.length, 'bytes');
                fs.writeFileSync('temp_zhutu1_new.jpg', buf);
                console.log('✅ 项目目录也保存了一份');
                ws.close();
            });
        }).on('error', function(e) {
            console.error('下载失败:', e.message);
            ws.close();
        });
    } else {
        console.log('没有找到合适的图片');
        ws.close();
    }
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
