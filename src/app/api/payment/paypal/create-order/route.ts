import { NextRequest, NextResponse } from "next/server";

const SETTINGS_COS_KEY = "payment/settings.json";
const COS_BUCKET = process.env.COS_BUCKET || "zishahu-images-1301674224";
const COS_REGION = process.env.COS_REGION || "ap-hongkong";
/** Public COS CDN URL — fast HTTP fetch, no SDK dependency */
const SETTINGS_COS_URL = `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${SETTINGS_COS_KEY}`;

function getDefaultPpSettings() {
  return {
    paypal_client_id: process.env.PAYPAL_CLIENT_ID || "",
    paypal_secret: process.env.PAYPAL_SECRET || "",
    paypal_mode: process.env.PAYPAL_MODE || "sandbox",
  };
}

let cachedSettings: any = null;
let lastFetch = 0;
const CACHE_TTL = 30_000; // 30 seconds

/**
 * Load PayPal settings from COS CDN URL (fast HTTP fetch, public bucket).
 * Falls back to Vercel env vars which are always available on any cold start.
 */
async function loadPpSettings() {
  // Return cached settings if fresh (within TTL)
  if (cachedSettings && Date.now() - lastFetch < CACHE_TTL) {
    return;
  }
  const defaults = getDefaultPpSettings();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); // 4s HTTP timeout
    const res = await fetch(SETTINGS_COS_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const saved = await res.json();
      cachedSettings = {
        paypal_client_id: saved.paypal_client_id || defaults.paypal_client_id,
        paypal_secret: saved.paypal_secret || defaults.paypal_secret,
        paypal_mode: saved.paypal_mode || defaults.paypal_mode,
      };
    } else {
      cachedSettings = defaults;
    }
  } catch {
    // CDN fetch failed — fall back to env vars (always work on Vercel)
    cachedSettings = defaults;
  }
  lastFetch = Date.now();
}

// Initial load
loadPpSettings();

function getBaseUrl() {
  const s = cachedSettings || getDefaultPpSettings();
  return s.paypal_mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const s = cachedSettings || getDefaultPpSettings();
  const clientId = s.paypal_client_id;
  const secret = s.paypal_secret;
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
    // Always reload settings at request time (cached within 30s TTL)
    await loadPpSettings();

    const body = await request.json();
    const { amount, currency = "USD", items, invoice_id } = body;

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
          invoice_id,
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
