p = r'F:\codex-yunxing\zishahu\src\components\product\ProductDetailContent.tsx'
with open(p, 'r', encoding='utf-8-sig') as f:
    c = f.read()

# 改圆点样式: h-2 -> h-1.5, w-2 -> w-1.5, gap-1.5 -> gap-1
c = c.replace(
    'className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">',
    'className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">'
)
c = c.replace(
    'className={cn("h-2 rounded-full transition-all", idx === selectedImage ? "w-6 bg-primary" : "w-2 bg-neutral-400/60 hover:bg-neutral-400/80")}',
    'className={cn("h-1.5 rounded-full transition-all", idx === selectedImage ? "w-4 bg-white/90" : "w-1.5 bg-white/40 hover:bg-white/60")}'
)

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print('4. \u8f6e\u64ad\u5706\u70b9\u5df2\u4f18\u5316')
