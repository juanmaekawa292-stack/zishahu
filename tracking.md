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
 

## Phase 1: Blog Content English Localization (2026-07-10)
- **Status**: ✅ Completed
- **Changes**:
  - Extended BlogPost interface with 	itle_en, excerpt_en, content_en fields
  - Inserted English content for all 10 blog posts (reconstructed from corrupted git history)
  - Added en locale to layout.tsx generateStaticParams (was missing, causing no EN page generation)
  - TypeScript build verified (105 static pages, all EN routes active)
- **Issues encountered**:
  - Previous LLM corrupted log.ts with 456 invalid UTF-8 sequences (Chinese bytes replaced with 0x3F)
  - Had to restore clean original from commit history and extract English content from corrupted blob
  - generateStaticParams in layout only included zh-CN and zh-TW; EN pages weren't being generated
- **Next**: Phase 2 - Product data English translation
## Phase 2: Product Data English Translation (2026-07-10)
- **Status**: ✅ Completed
- **Changes**:
  - Fixed 355 missing `]` in variant arrays across products.ts (pre-existing structural bug)
  - Patched ProductDetailContent.tsx to use specs_en when locale is "en"
  - Patched ProductPageClient.tsx JSON-LD to use specs_en when locale is "en"
  - Polished Chinese specs values in specs_en fields (shape names, scenarios, kiln types, etc.)
  - TypeScript build verified (105 static pages, all locales clean)
- **Issues encountered**:
  - products.ts had ~355 instances where variant array closing `]` was missing (bare comma instead of `],`)
  - PowerShell encoding issues when writing temp Python scripts (UTF-16 default vs UTF-8)
  - Previous agent's temp scripts (*.cjs, *.mjs, *.bak) left in workspace — cleaned up
- **Next**: Phase 3 - New English blog posts (6+ articles targeting high-volume keywords)
