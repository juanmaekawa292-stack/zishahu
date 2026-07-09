# Deploy Trigger
Deployed at: 2026-06-17T11:20:08.789Z
 # Deploy Trigger
 Deployed at: 2026-07-05T17:53:00.000Z
 
 ## 2026-07-05 Checkout修复
 - **Tax**: 移除税费 (tax = 0)，订单不显示税费行
 - **地址校验**: PayPal按钮添加 onValidate 回调，空地址时阻止弹窗并提示
 - **闭包修复**: PayPalButton 用 useRef 避免闭包过期
 - **测试结果**: API全部正常 (checkout 201, PayPal create-order 200)
 - **PayPal模式**: 保持 sandbox，等审核通过再切 live
 
