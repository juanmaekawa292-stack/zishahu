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
    
    console.log('等待豆包生成图片...');
    
    for (var attempt = 1; attempt <= 120; attempt++) {
        // 检查页面文本末尾，看有没有新生成的内容
        var textResult = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(document.body.innerText.length - 500)',
            returnByValue: true
        });
        var tailText = textResult.result.result.value;
        
        // 检查有没有大图出现（带完整src的img，完成状态）
        var imgResult = await send('Runtime.evaluate', {
            expression: '(function() { var imgs = document.querySelectorAll("img"); for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; if (img.naturalWidth > 400 && img.naturalHeight > 400 && img.complete && (img.src || "").length > 100) { return JSON.stringify({ found: true, index: i, w: img.naturalWidth, h: img.naturalHeight, srcLen: (img.src || "").length }); } } return JSON.stringify({ found: false }); })()',
            returnByValue: true
        });
        var imgInfo = JSON.parse(imgResult.result.result.value);
        
        console.log('[' + attempt + 's] 检查... 文本尾:', tailText.substring(0, 80));
        
        if (imgInfo.found) {
            console.log('✅ 检测到生成好的大图!', JSON.stringify(imgInfo));
            
            // 获取完整src
            var fullSrc = await send('Runtime.evaluate', {
                expression: 'document.querySelectorAll("img")[' + imgInfo.index + '].src',
                returnByValue: true
            });
            var dataUrl = fullSrc.result.result.value;
            console.log('图片数据长度:', dataUrl.length);
            
            // 保存图片
            if (dataUrl.indexOf('data:image') === 0) {
                var commaIdx = dataUrl.indexOf(',');
                var base64Data = dataUrl.substring(commaIdx + 1);
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
            }
            
            ws.close();
            return;
        }
        
        // 看文本有没有变化（表示生成完成）
        if (tailText.indexOf('已生成') >= 0 || tailText.indexOf('生成完成') >= 0 || 
            tailText.indexOf('下载') >= 0 || tailText.indexOf('保存') >= 0) {
            console.log('页面文本有完成提示:', tailText.substring(0, 200));
        }
        
        await new Promise(function(r) { setTimeout(r, 2000); });
    }
    
    console.log('超时，未检测到生成');
    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) { console.error('错误:', e.message); });
