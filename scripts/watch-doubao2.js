const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const WS_URL = "ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A";
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
                ws.removeListener("message", handler);
                resolve(msg);
            }
        };
        ws.on("message", handler);
    });
}

async function run() {
    await send("Page.enable");
    await send("Runtime.enable");
    
    console.log("等待豆包处理图片...");
    
    for (var attempt = 1; attempt <= 60; attempt++) {
        // 检查有没有生成好的真实图片（不是SVG的，src长度大）
        var imgResult = await send("Runtime.evaluate", {
            expression: '(function() { var imgs = document.querySelectorAll("img"); for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; var src = img.src || ""; if (img.naturalWidth > 400 && img.naturalHeight > 400 && img.complete && src.length > 1000 && src.indexOf("data:image/svg") !== 0) { return JSON.stringify({ found: true, index: i, w: img.naturalWidth, h: img.naturalHeight }); } } return JSON.stringify({ found: false }); })()',
            returnByValue: true
        });
        var imgInfo = JSON.parse(imgResult.result.result.value);
        
        if (attempt % 5 === 0 || attempt === 1) {
            // 看所有img标签
            var allImgs = await send("Runtime.evaluate", {
                expression: '(function() { var imgs = document.querySelectorAll("img"); var res = []; for (var i = 0; i < imgs.length; i++) { var img = imgs[i]; var src = img.src || ""; res.push({ idx: i, w: img.naturalWidth, h: img.naturalHeight, srcLen: src.length, srcStart: src.substring(0,30), complete: img.complete }); } return JSON.stringify(res); })()',
                returnByValue: true
            });
            console.log("[" + attempt + "s] 所有img:", allImgs.result.result.value);
        }
        
        if (imgInfo.found) {
            console.log("✅ 检测到真实大图!", JSON.stringify(imgInfo));
            
            var fullSrc = await send("Runtime.evaluate", {
                expression: "document.querySelectorAll('img')[" + imgInfo.index + "].src",
                returnByValue: true
            });
            var dataUrl = fullSrc.result.result.value;
            console.log("图片数据长度:", dataUrl.length);
            
            var outDir = "D:\\图快下载器\\P图成品\\00_古悦堂宜兴名家紫砂壶 纯手工功夫茶壶茶具套装泡茶壶如意西施壶";
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            
            if (dataUrl.indexOf("data:image") === 0) {
                var commaIdx = dataUrl.indexOf(",");
                var base64Data = dataUrl.substring(commaIdx + 1);
                var imgBuffer = Buffer.from(base64Data, "base64");
                var targetPath = path.join(outDir, "主图_1.jpg");
                fs.writeFileSync(targetPath, imgBuffer);
                console.log("✅ 已保存到:", targetPath, "大小:", imgBuffer.length, "bytes");
            } else if (dataUrl.indexOf("http") === 0 || dataUrl.indexOf("blob:") === 0) {
                console.log("是HTTP/Blob图片，URL:", dataUrl.substring(0, 100));
            } else {
                console.log("未知格式, 前缀:", dataUrl.substring(0, 50));
            }
            
            ws.close();
            return;
        }
        
        await new Promise(function(r) { setTimeout(r, 2000); });
    }
    
    console.log("超时，未检测到生成");
    ws.close();
}

ws.on("open", run);
ws.on("error", function(e) { console.error("错误:", e.message); });
