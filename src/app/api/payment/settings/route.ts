import { NextResponse } from "next/server";
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

function getDefaultSettings() {
  return {
    oid_partner: process.env.LIANLIAN_OID_PARTNER || "",
    private_key: process.env.LIANLIAN_PRIVATE_KEY || "",
    paypal_client_id: process.env.PAYPAL_CLIENT_ID || "",
    paypal_secret: process.env.PAYPAL_SECRET || "",
    paypal_mode: process.env.PAYPAL_MODE || "sandbox",
  };
}

// In-memory cache; initializes from COS, falls back to env vars
let settings: any = { ...getDefaultSettings() };

async function loadFromCos() {
  const c = getCosEnv();
  if (!c) return;
  try {
    const result = await new Promise<any>((resolve, reject) => {
      c.cos.getObject({ Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY }, (err: any, data: any) => {
        if (err) { if (err.code === "NoSuchKey") resolve(null); else reject(err); }
        else resolve(data);
      });
    });
    if (result?.Body) {
      const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
      const saved = JSON.parse(body.toString("utf-8"));
      settings = { ...getDefaultSettings(), ...saved };
    }
  } catch {}
}

async function saveToCos(data: any) {
  const c = getCosEnv();
  if (!c) return;
  try {
    await new Promise<void>((resolve, reject) => {
      c.cos.putObject({ Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY, Body: JSON.stringify(data, null, 2), ContentType: "application/json" }, (err: any) => {
        if (err) reject(err); else resolve();
      });
    });
  } catch {}
}

// Load saved settings on module init (fire-and-forget)
loadFromCos();

export async function GET() {
  return NextResponse.json({
    success: true,
    oid_partner: settings.oid_partner,
    private_key: settings.private_key,
    paypal_client_id: settings.paypal_client_id,
    paypal_secret: settings.paypal_secret,
    paypal_mode: settings.paypal_mode,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    settings.oid_partner = body.oid_partner || "";
    settings.private_key = body.private_key || "";
    settings.paypal_client_id = body.paypal_client_id || "";
    settings.paypal_secret = body.paypal_secret || "";
    settings.paypal_mode = body.paypal_mode || "sandbox";
    // Persist to COS (fire-and-forget)
    saveToCos(settings);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
