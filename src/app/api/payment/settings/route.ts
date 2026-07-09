import { NextResponse } from "next/server";
import COS from "cos-nodejs-sdk-v5";

const SETTINGS_COS_KEY = "payment/settings.json";
const COS_BUCKET = process.env.COS_BUCKET || "zishahu-images-1301674224";
const COS_REGION = process.env.COS_REGION || "ap-hongkong";

/** Public COS CDN URL for fast GET reads */
const SETTINGS_COS_URL = `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${SETTINGS_COS_KEY}`;

function getCosEnv() {
  const sid = process.env.COS_SECRET_ID;
  const skey = process.env.COS_SECRET_KEY;
  if (!sid || !skey) return null;
  return { cos: new COS({ SecretId: sid, SecretKey: skey }), bucket: COS_BUCKET, region: COS_REGION };
}

function getDefaultSettings() {
  return {
    oid_partner: process.env.LIANLIAN_OID_PARTNER || "",
    private_key: process.env.LIANLIAN_PRIVATE_KEY || "",
    paypal_client_id: process.env.PAYPAL_CLIENT_ID || "",
    paypal_secret: process.env.PAYPAL_SECRET || "",
    paypal_mode: process.env.PAYPAL_MODE || "sandbox",
  };
}

let cachedSettings: any = null;
let lastFetch = 0;
const CACHE_TTL = 30_000; // 30s

/** Load settings via COS CDN URL (fast HTTP fetch, public bucket). Fallback to env vars. */
async function loadSettings() {
  if (cachedSettings && Date.now() - lastFetch < CACHE_TTL) return;
  const defaults = getDefaultSettings();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(SETTINGS_COS_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const saved = await res.json();
      cachedSettings = { ...defaults, ...saved };
    } else {
      cachedSettings = defaults;
    }
  } catch {
    cachedSettings = defaults;
  }
  lastFetch = Date.now();
}

/** Write settings to COS using SDK (needs auth) */
async function saveToCos(data: any) {
  const c = getCosEnv();
  if (!c) throw new Error("COS not configured");
  const body = JSON.stringify(data, null, 2);

  // putObjectWithTimeout (inline, 8s)
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("COS putObject timed out after 8000ms")), 8000);
    try {
      c.cos.putObject(
        { Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY, Body: body, ContentType: "application/json" },
        (err: any) => { clearTimeout(timer); if (err) reject(err); else resolve(); }
      );
    } catch (e) { clearTimeout(timer); reject(e); }
  });
}

// Warm cache
loadSettings();

export async function GET() {
  await loadSettings();
  return NextResponse.json({ success: true, ...(cachedSettings || getDefaultSettings()) });
}

export async function POST(request: any) {
  try {
    const body = await request.json();
    cachedSettings = { ...getDefaultSettings(), ...body };
    await saveToCos(cachedSettings);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("POST settings error:", e);
    return NextResponse.json({ success: false, error: e.message || String(e) }, { status: 400 });
  }
}
