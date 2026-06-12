 import { NextRequest, NextResponse } from "next/server";

 interface ContactBody {
   name: string;
   email: string;
   orderId?: string;
   subject: string;
   message: string;
 }

 // In-memory contact submissions (will be replaced with email/DB integration)
 const submissions: (ContactBody & { id: string; createdAt: string })[] = [];

 export async function POST(request: NextRequest) {
   try {
     const body: ContactBody = await request.json();

     // Validate
     if (!body.name?.trim()) {
       return NextResponse.json({ error: "请填写您的姓名" }, { status: 400 });
     }
     if (!body.email?.trim() || !body.email.includes("@")) {
       return NextResponse.json({ error: "请填写有效的电子邮箱" }, { status: 400 });
     }
     if (!body.subject?.trim()) {
       return NextResponse.json({ error: "请选择主题" }, { status: 400 });
     }
     if (!body.message?.trim() || body.message.trim().length < 10) {
       return NextResponse.json({ error: "消息内容至少 10 个字符" }, { status: 400 });
     }

     const submission = {
       id: `TKT-${Date.now().toString(36).toUpperCase()}`,
       ...body,
       createdAt: new Date().toISOString(),
     };

     submissions.push(submission);

     // TODO: Send email notification to support@zishahu.com
     // TODO: Store in database

     return NextResponse.json(
       {
         success: true,
         ticketId: submission.id,
         message: "消息已发送，我们会在 24 小时内回复您。",
       },
       { status: 201 }
     );
   } catch (error) {
     console.error("Contact form error:", error);
     return NextResponse.json(
       { error: "提交失败，请稍后重试或直接发送邮件至 support@zishahu.com" },
       { status: 500 }
     );
   }
 }

 export async function GET() {
   // Return all submissions (for admin panel)
   return NextResponse.json(submissions.sort(
     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
   ));
 }
