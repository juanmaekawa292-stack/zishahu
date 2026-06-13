 import { NextRequest, NextResponse } from "next/server";

 // In-memory FAQ data matching data/faq.md content
 const faqData = {
   shipping: [
     { q: "下单后多久发货？", a: "正常情况下，我们会在收到订单后的 1-3 个工作日内从宜兴发货。定制/手工订单可能需要 5-7 个工作日。" },
     { q: "支持哪些国际物流方式？", a: "国际小包（10-15 个工作日，可追踪）、国际专线（7-10 个工作日，可追踪，含保险）、DHL 快递（3-5 个工作日，可追踪，含保险）。" },
     { q: "如何查询物流信息？", a: "发货后您会收到包含物流单号的邮件通知。您可以在订单页面或物流公司官网追踪包裹。" },
     { q: "发往哪些国家和地区？", a: "我们发往全球主要国家和地区，包括美国、加拿大、英国、澳大利亚、欧盟各国、日本、韩国、新加坡、马来西亚、台湾、香港等。" },
     { q: "包裹被海关扣留怎么办？", a: "请第一时间联系客服，我们会配合提供清关所需文件（发票、产地证明等）。" },
   ],
   tariffs: [
     { q: "到我的国家需要交关税吗？", a: "关税政策因国家和商品价值而异。美国 $800 以下、欧盟 €22 以下通常免关税。新加坡和香港大部分商品免税。" },
     { q: "关税由谁承担？", a: "买家承担目的地国家的关税和税费。" },
   ],
   returns: [
     { q: "退换货期限是多久？", a: "自签收之日起 30 天内可申请退换货。" },
     { q: "哪些情况可以退换货？", a: "运输损坏、产品瑕疵、与描述不符可免费退换；无理由退换（不影响二次销售）买家承担退回运费。" },
     { q: "退款需要多久到账？", a: "PayPal 3-5 个工作日，Stripe 信用卡 5-10 个工作日。" },
   ],
   care: [
     { q: "新壶需要开壶吗？", a: "需要。清水冲洗 → 软布擦拭 → 纯净水小火煮沸 30 分钟（可放茶叶同煮）→ 自然冷却冲净即可。" },
     { q: "一壶可以泡多种茶吗？", a: "不建议。紫砂壶有吸附性，建议一壶一茶。" },
     { q: "如何保养紫砂壶？", a: "使用后及时清洗倒扣晾干，不要用洗洁精，用软布擦拭，保持通风干燥。" },
     { q: "如何辨别紫砂壶真假？", a: "听声音（真紫砂清脆悦耳）、看气孔（真紫砂有微小气孔）、看颜色（自然温润）。" },
   ],
   payment: [
     { q: "支持哪些支付方式？", a: "我们支持 Stripe 信用卡/借记卡 和 PayPal。" },
     { q: "下单后多久可以取消订单？", a: "订单在未发货状态下可以取消。已发货的订单如需取消请走退货流程。" },
     { q: "如何查看订单状态？", a: "登录后在「我的订单」页面查看，或使用订单号查询。" },
   ],
 };

 export async function GET(request: NextRequest) {
   const { searchParams } = new URL(request.url);
   const category = searchParams.get("category");
   const search = searchParams.get("search");

   let results = category && faqData[category as keyof typeof faqData]
     ? { [category]: faqData[category as keyof typeof faqData] }
     : faqData;

   if (search) {
     const q = search.toLowerCase();
     const filtered: Record<string, { q: string; a: string }[]> = {};
     for (const [cat, items] of Object.entries(results)) {
       const matched = items.filter(
         (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
       );
       if (matched.length > 0) filtered[cat] = matched;
     }
     results = filtered;
   }

   return NextResponse.json({
     categories: Object.keys(results),
     items: results,
     total: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
  });
}
