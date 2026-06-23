 import { NextRequest, NextResponse } from "next/server";
 
 // Read payment settings (in-memory for now)
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
     // Load settings from shared module
     const settingsRes = await fetch(new URL("/api/payment/settings", request.url));
     const settingsData = await settingsRes.json();
     if (settingsData.paypal_client_id) {
       settings.paypal_client_id = settingsData.paypal_client_id;
     }
     if (settingsData.paypal_mode) {
       settings.paypal_mode = settingsData.paypal_mode;
     }
 
     const body = await request.json();
     const { amount, currency = "USD", items } = body;
 
     const accessToken = await getAccessToken();
 
     const orderPayload: any = {
       intent: "CAPTURE",
       purchase_units: [
         {
           amount: {
             currency_code: currency,
             value: amount.toFixed(2),
             breakdown: {
               item_total: {
                 currency_code: currency,
                 value: amount.toFixed(2),
               },
             },
           },
           items: items?.map((item: any) => ({
             name: item.name?.substring(0, 127) || "Product",
             unit_amount: {
               currency_code: currency,
               value: item.price?.toFixed(2) || "0.00",
             },
             quantity: item.quantity?.toString() || "1",
           })) || [],
         },
       ],
     };
 
     const res = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${accessToken}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify(orderPayload),
     });
 
     const data = await res.json();
     if (!res.ok) {
       return NextResponse.json({ error: data.message || "PayPal order creation failed" }, { status: 500 });
     }
 
     return NextResponse.json({ id: data.id, status: data.status });
   } catch (error: any) {
     console.error("PayPal create order error:", error);
     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
   }
 }
