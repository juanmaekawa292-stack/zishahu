import { NextRequest, NextResponse } from "next/server";
import COS from "cos-nodejs-sdk-v5";

const SETTINGS_COS_KEY = "payment/settings.json";

function getCosEnv() {
  const sid = process.env.COS_SECRET_ID;
  const skey = process.env.COS_SECRET_KEY;
  const bkt = process.env.COS_BUCKET || "zishahu-images-1301674224";
  const reg = process.env.COS_REGION || "ap-hongkong";
  if (!sid || !skey) return null;
  return { cos: new COS({ SecretId: sid, SecretKey: skey }), bucket: bkt, region: reg };
}

function getDefaultPpSettings() {
  return {
    paypal_client_id: process.env.PAYPAL_CLIENT_ID || "",
    paypal_secret: process.env.PAYPAL_SECRET || "",
    paypal_mode: process.env.PAYPAL_MODE || "sandbox",
  };
}

let settings = { ...getDefaultPpSettings() };

async function loadPpSettings() {
  const c = getCosEnv();
  if (!c) return;
  try {
    const result: any = await new Promise((resolve, reject) => {
      c.cos.getObject({ Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY }, (err, data) => {
        if (err) { if (err.code === "NoSuchKey") resolve(null); else reject(err); }
        else resolve(data);
      });
    });
    if (result?.Body) {
      const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
      const saved = JSON.parse(body.toString("utf-8"));
      settings.paypal_client_id = saved.paypal_client_id || settings.paypal_client_id;
      settings.paypal_secret = saved.paypal_secret || settings.paypal_secret;
      settings.paypal_mode = saved.paypal_mode || settings.paypal_mode;
    }
  } catch (e) {
    console.error("loadPpSettings error:", e);
  }
}

async function loadLatestSettings() {
  const c = getCosEnv();
  if (!c) return;
  try {
    const result: any = await new Promise((resolve, reject) => {
      c.cos.getObject({ Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY }, (err, data) => {
        if (err) { if (err.code === "NoSuchKey") resolve(null); else reject(err); }
        else resolve(data);
      });
    });
    if (result?.Body) {
      const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
      const saved = JSON.parse(body.toString("utf-8"));
      settings = {
        paypal_client_id: saved.paypal_client_id || settings.paypal_client_id || process.env.PAYPAL_CLIENT_ID || "",
        paypal_secret: saved.paypal_secret || settings.paypal_secret || process.env.PAYPAL_SECRET || "",
        paypal_mode: saved.paypal_mode || settings.paypal_mode || process.env.PAYPAL_MODE || "sandbox",
      };
    }
  } catch (e) {
    console.error("loadLatestSettings error:", e);
  }
}

loadPpSettings();

function getBaseUrl() {
  return settings.paypal_mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const clientId = settings.paypal_client_id;
  const secret = settings.paypal_secret;
  if (!clientId || !secret) {
    throw new Error("PayPal Client ID or Secret not configured");
  }
  const auth = Buffer.from(clientId + ":" + secret).toString("base64");
  const res = await fetch(getBaseUrl() + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal auth failed: " + (await res.text()));
  const data = await res.json();
  return data.access_token;
}

export async function POST(request: any) {
  try {
    // Always reload settings from COS to handle cold starts
    await loadLatestSettings();

    const body = await request.json();
    const { amount, currency = "USD", items } = body;

    const accessToken = await getAccessToken();

    const orderPayload = {
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
            unit_amount: { currency_code: currency, value: item.price?.toFixed(2) || "0.00" },
            quantity: item.quantity?.toString() || "1",
          })) || [],
        },
      ],
    };

    const res = await fetch(getBaseUrl() + "/v2/checkout/orders", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message || "PayPal order creation failed" }, { status: 500 });

    return NextResponse.json({ id: data.id, status: data.status });
  } catch (error: any) {
    console.error("PayPal create order error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
