const WebSocket = require('ws');
const fs = require('fs');

const WS_URL = 'ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A';
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
    
    console.log('等待豆包处理图片...');
    
    for (var attempt = 1; attempt <= 60; attempt++) {
        // 检查页面文本
        var textResult = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(document.body.innerText.length - 500)',
            returnByValue: true
        });
        var tailText = textResult.result.result.value;
        
        // 检查有没有生成好的大图（自然尺寸大于400px的）
        var imgResult = await send('Runtime.evaluate', {
            expression: '(function() { var imgs = document.querySelectorAll("img"); for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; if (img.naturalWidth > 400 && img.naturalHeight > 400 && img.complete && (img.src || "").length > 100) { return JSON.stringify({ found: true, index: i, w: img.naturalWidth, h: img.naturalHeight }); } } return JSON.stringify({ found: false }); })()',
            returnByValue: true
        });
        var imgInfo = JSON.parse(imgResult.result.result.value);
        
        if (attempt % 5 === 0 || imgInfo.found) {
            console.log('[' + attempt + 's] 文本尾:', (tailText||"").substring(0, 80));
        }
        
        if (imgInfo.found) {
            console.log('✅ 检测到生成好的大图!', JSON.stringify(imgInfo));
            
            // 获取完整src
            var fullSrc = await send('Runtime.evaluate', {
                expression: 'document.querySelectorAll("img")[' + imgInfo.index + '].src',
                returnByValue: true
            });
            var dataUrl = fullSrc.result.result.value;
            console.log('图片数据长度:', dataUrl.length);
            console.log('src前缀:', dataUrl.substring(0, 50));
            
            // 保存图片
            var outDir = "D:\\图快下载器\\P图成品\\00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            
            if (dataUrl.indexOf('data:image') === 0) {
                var commaIdx = dataUrl.indexOf(',');
                var base64Data = dataUrl.substring(commaIdx + 1);
                var imgBuffer = Buffer.from(base64Data, 'base64');
                var targetPath = path.join(outDir, '主图_1.jpg');
                fs.writeFileSync(targetPath, imgBuffer);
                console.log('✅ 已保存到:', targetPath, '大小:', imgBuffer.length, 'bytes');
            } else if (dataUrl.indexOf('http') === 0) {
                console.log('是HTTP图片，需要下载:', dataUrl.substring(0, 100));
            }
            
            ws.close();
            return;
        }
        
        // 看文本有没有变化
        if (tailText.indexOf('已生成') >= 0 || tailText.indexOf('生成完成') >= 0 || 
            tailText.indexOf('下载') >= 0 || tailText.indexOf('保存') >= 0) {
            console.log('页面有完成提示:', tailText.substring(0, 200));
        }
        
        await new Promise(function(r) { setTimeout(r, 2000); });
    }
    
    console.log('超时，未检测到生成');
    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
