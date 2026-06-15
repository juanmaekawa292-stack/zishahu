const WebSocket = require('ws');
const WS_URL = "ws://127.0.0.1:9222/devtools/page/C782DDE1E325CA444FDABD5399B74B0A";
const ws = new WebSocket(WS_URL);
let msgId = 1;
function send(method, params) { if(params===undefined)params={};
  return new Promise(resolve=>{ const id=msgId++; ws.send(JSON.stringify({id,method,params})); const h=d=>{const m=JSON.parse(d.toString()); if(m.id===id){ws.removeListener('message',h); resolve(m);}}; ws.on('message',h); });
}
async function run() {
  await send('Page.enable'); await send('Runtime.enable');
  const btns = await send('Runtime.evaluate', {
    expression: "(function(){ var b=document.querySelectorAll('button'); return Array.from(b).filter(x=>x.offsetWidth>0).map(x=>({t:(x.textContent||'').trim().substring(0,30), w:x.offsetWidth, h:x.offsetHeight})).filter(x=>x.t); })()",
    returnByValue: true
  });
  console.log('BUTTONS:');
  btns.result.result.value.forEach(function(b,i){ console.log(i+': "'+b.t+'" ('+b.w+'x'+b.h+')'); });
  ws.close();
}
ws.on('open', run);
ws.on('error', e=>console.error('Error:', e.message));
