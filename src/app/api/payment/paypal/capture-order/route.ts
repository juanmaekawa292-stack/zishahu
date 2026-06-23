 import { NextRequest, NextResponse } from "next/server";
 
 var settings: any = { paypal_client_id: "", paypal_secret: "", paypal_mode: "sandbox" };
 
 function getBaseUrl() {
   return settings.paypal_mode === "live"
     ? "https://api-m.paypal.com"
     : "https://api-m.sandbox.paypal.com";
 }
 
 async function getAccessToken(): Promise<string> {
   const clientId = settings.paypal_client_id;
   const secret = settings.paypal_secret;
   if (!clientId || !secret) {
     throw new Error("PayPal Client ID or Secret not configured");
   }
   const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
   const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
     method: "POST",
     headers: {
       Authorization: `Basic ${auth}`,
       "Content-Type": "application/x-www-form-urlencoded",
     },
     body: "grant_type=client_credentials",
   });
   if (!res.ok) {
     const text = await res.text();
     throw new Error(`PayPal auth failed: ${text}`);
   }
   const data = await res.json();
   return data.access_token;
 }
 
 export async function POST(request: NextRequest) {
   try {
     // Load settings
     const settingsRes = await fetch(new URL("/api/payment/settings", request.url));
     const settingsData = await settingsRes.json();
     if (settingsData.paypal_client_id) settings.paypal_client_id = settingsData.paypal_client_id;
     if (settingsData.paypal_secret) settings.paypal_secret = settingsData.paypal_secret;
     if (settingsData.paypal_mode) settings.paypal_mode = settingsData.paypal_mode;
 
     const { orderId } = await request.json();
     if (!orderId) {
       return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
     }
 
     const accessToken = await getAccessToken();
 
     const res = await fetch(`${getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${accessToken}`,
         "Content-Type": "application/json",
       },
     });
 
     const data = await res.json();
     if (!res.ok) {
       return NextResponse.json({ error: data.message || "PayPal capture failed" }, { status: 500 });
     }
 
     return NextResponse.json({
       id: data.id,
       status: data.status,
       captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id,
     });
   } catch (error: any) {
     console.error("PayPal capture order error:", error);
     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
   }
 }
