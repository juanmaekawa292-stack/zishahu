const WebSocket = require('ws');
const fs = require('fs');

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
    await send('Runtime.enable');
    
    console.log("监控豆包生成状态...");
    
    let attempts = 0;
    const maxAttempts = 60; // 最多等5分钟
    
    while (attempts < maxAttempts) {
        attempts++;
        
        // 检查页面文本，看看有没有生成完成的提示
        const textResult = await send('Runtime.evaluate', {
            expression: `document.body.innerText.substring(0, 5000)`,
            returnByValue: true
        });
        const text = textResult.result.result.value || '';
        
        // 检查有没有图片生成完成的关键词
        if (text.includes('生成完成') || text.includes('已生成') || text.includes('下载图片') || 
            text.includes('点击下载') || text.includes('图片已生成') || text.includes('保存图片') ||
            text.includes('处理完成') || text.includes('已处理')) {
            console.log("✅ 检测到生成完成！第" + attempts + "次检查");
            
            // 获取页面中所有图片元素
            const imgResult = await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const imgs = document.querySelectorAll('img');
                        const results = [];
                        imgs.forEach((img, i) => {
                            const src = img.src || '';
                            const rect = img.getBoundingClientRect();
                            // 找大小合适的图片（排除头像、图标等小图）
                            if (rect.width > 200 && rect.height > 200 && src.length > 100) {
                                results.push({
                                    index: i,
                                    width: Math.round(rect.width),
                                    height: Math.round(rect.height),
                                    srcPrefix: src.substring(0, 80),
                                    isBase64: src.startsWith('data:')
                                });
                            }
                        });
                        return JSON.stringify(results);
                    })()
                `,
                returnByValue: true
            });
            console.log("检测到的大图:", imgResult.result.result.value);
            
            ws.close();
            return;
        }
        
        // 看看最近的消息区域有没有图片
        const recentResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const imgs = document.querySelectorAll('img');
                    for (const img of imgs) {
                        const src = img.src || '';
                        const rect = img.getBoundingClientRect();
                        if (rect.width > 200 && rect.height > 200 && src.length > 100) {
                            return '找到大图: ' + Math.round(rect.width) + 'x' + Math.round(rect.height) + ' isBase64:' + src.startsWith('data:');
                        }
                    }
                    return '未检测到生成好的大图';
                })()
            `,
            returnByValue: true
        });
        
        console.log("第" + attempts + "次检查:", recentResult.result.result.value.substring(0, 100));
        
        // 等5秒再检查
        await new Promise(r => setTimeout(r, 5000));
    }
    
    console.log("超时未检测到生成完成");
    ws.close();
}

ws.on('open', run);
ws.on('error', (e) => console.error('错误:', e.message));
