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
        const imgPath = path.resolve('temp_zhutu1.jpg');
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
                    
                    // 获取输入框的react属性
                    const keys = Object.keys(ta);
                    const reactKey = keys.find(k => k.startsWith('__react'));
                    
                    // 设置值
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                    nativeInputValueSetter.call(ta, '帮我把这张商品图里的"天猫"水印、"618活动信息"等文字P掉，保持图片原有比例和背景不变，只去掉水印和活动促销文字');
                    
                    // 触发React的input事件
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    return '已输入文字' + ' react:' + (reactKey || 'none');
                })()
            `,
            returnByValue: true
        });
        console.log("输入结果:", textResult.result.result.value);
        
        // 4. 找到发送按钮
        await new Promise(r => setTimeout(r, 1000));
        
        const sendBtnResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    // 找发送按钮
                    const buttons = document.querySelectorAll('button');
                    for (const btn of buttons) {
                        const txt = btn.textContent.trim();
                        if (txt.includes('发送') || txt.includes('Send') || txt === '') {
                            // 检查它是否可见且在输入框附近
                            const rect = btn.getBoundingClientRect();
                            if (rect.width > 0 && rect.height > 0 && rect.top > 0) {
                                return JSON.stringify({
                                    found: true,
                                    text: txt,
                                    rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                                });
                            }
                        }
                    }
                    return JSON.stringify({ found: false });
                })()
            `,
            returnByValue: true
        });
        console.log("发送按钮:", sendBtnResult.result.result.value);
        
        // 尝试按 Enter 发送
        const enterResult = await send('Input.dispatchKeyEvent', {
            type: 'keyDown',
            key: 'Enter',
            code: 'Enter',
            windowsVirtualKeyCode: 13,
            text: '\n'
        });
        console.log("Enter键发送:", JSON.stringify(enterResult));
        
        await new Promise(r => setTimeout(r, 500));
        
        const enterUp = await send('Input.dispatchKeyEvent', {
            type: 'keyUp',
            key: 'Enter',
            code: 'Enter',
            windowsVirtualKeyCode: 13
        });
        console.log("Enter释放");
        
        console.log("✅ 指令已发送到豆包！");
    }

    ws.close();
}

ws.on('open', run);
ws.on('error', (e) => console.error('错误:', e.message));
