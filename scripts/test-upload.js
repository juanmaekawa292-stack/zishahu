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
    console.log("连接豆包页面...");
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    // 第一张要P的图：古悦堂主图_1.jpg（左下角有店铺品牌水印）
    const imgPath = path.resolve('D:\\图快下载器\\淘宝采集\\0615\\00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶\\主图_1.jpg');
    console.log("准备上传图片:", imgPath);
    console.log("文件存在?", fs.existsSync(imgPath));

    // 1. 先截图看看当前页面状态
    const screenshot = await send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 70
    });
    fs.writeFileSync('doubao_screenshot.jpg', Buffer.from(screenshot.result.data, 'base64'));
    console.log("截图已保存");

    // 2. 找到input[type=file]并上传图片
    const docResult = await send('DOM.getDocument', { depth: -1 });
    const rootId = docResult.result.root.nodeId;

    const searchResult = await send('DOM.querySelector', {
        nodeId: rootId,
        selector: 'input[type=file]'
    });
    console.log("file input nodeId:", searchResult.result.nodeId);

    if (searchResult.result.nodeId) {
        // 上传图片
        const setResult = await send('DOM.setFileInputFiles', {
            nodeId: searchResult.result.nodeId,
            files: [imgPath]
        });
        console.log("图片上传结果:", JSON.stringify(setResult));
        console.log("✅ 图片已上传到豆包！等待几秒让豆包处理...");

        // 等待几秒
        await new Promise(r => setTimeout(r, 3000));
        
        // 3. 发消息给豆包 - 找到textarea输入内容
        const textResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const ta = document.querySelector('textarea');
                    if (!ta) return 'no textarea';
                    
                    // 设置值
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                    nativeInputValueSetter.call(ta, '帮我去掉这张商品图底部的水印和Logo文字（左下角店铺名和右下角天猫Logo），保持图片其他部分不变');
                    
                    // 触发React的input事件
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    return '已输入文字';
                })()
            `,
            returnByValue: true
        });
        console.log("输入结果:", textResult.result.result.value);
        
        // 4. 找发送按钮并点击
        await new Promise(r => setTimeout(r, 1000));
        
        const sendBtnResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const buttons = document.querySelectorAll('button');
                    for (const btn of buttons) {
                        const txt = btn.textContent.trim();
                        const rect = btn.getBoundingClientRect();
                        // 发送按钮通常在输入框附近，没有文字或特定class
                        if (rect.width > 30 && rect.height > 30 && rect.top > 800 && rect.left > 300 && rect.left < 400) {
                            btn.click();
                            return 'clicked button at ' + Math.round(rect.left) + ',' + Math.round(rect.top);
                        }
                    }
                    return 'no send button found';
                })()
            `,
            returnByValue: true
        });
        console.log("发送结果:", sendBtnResult.result.result.value);

        console.log("✅ 指令已发送！正在等待豆包处理...");
        
    } else {
        console.log("未找到file input");
    }

    ws.close();
}

ws.on('open', run);
ws.on('error', function(e) {
    console.error('错误:', e.message);
});
