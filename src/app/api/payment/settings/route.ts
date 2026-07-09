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

/**
 * Timeout wrapper for COS getObject — prevents indefinite hanging on Vercel cold starts.
 */
function getObjectWithTimeout(cos: any, params: any, timeoutMs = 5000): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`COS getObject timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    try {
      cos.getObject(params, (err: any, data: any) => {
        clearTimeout(timer);
        if (err) reject(err);
        else resolve(data);
      });
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });
}

/**
 * Timeout wrapper for COS putObject — prevents indefinite hanging on Vercel cold starts.
 */
function putObjectWithTimeout(cos: any, params: any, timeoutMs = 8000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`COS putObject timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    try {
      cos.putObject(params, (err: any) => {
        clearTimeout(timer);
        if (err) reject(err);
        else resolve();
      });
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });
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

let settings = { ...getDefaultSettings() };

async function loadFromCos(): Promise<void> {
  const c = getCosEnv();
  if (!c) return;
  try {
    const result: any = await getObjectWithTimeout(
      c.cos,
      { Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY },
      5000
    ).catch((err: any) => {
      if (err.code === "NoSuchKey") return null;
      throw err;
    });
    if (result?.Body) {
      const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
      const saved = JSON.parse(body.toString("utf-8"));
      settings = { ...getDefaultSettings(), ...saved };
    }
  } catch (e: any) {
    console.error("loadFromCos error:", e);
  }
}

async function saveToCos(data: any) {
  const c = getCosEnv();
  if (!c) throw new Error("COS not configured");
  const body = JSON.stringify(data, null, 2);
  await putObjectWithTimeout(
    c.cos,
    { Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY, Body: body, ContentType: "application/json" },
    8000
  );
}

loadFromCos();

export async function GET() {
  const c = getCosEnv();
  let merged = { ...getDefaultSettings() };
  if (c) {
    try {
      const result: any = await getObjectWithTimeout(
        c.cos,
        { Bucket: c.bucket, Region: c.region, Key: SETTINGS_COS_KEY },
        5000
      ).catch((err: any) => {
        if (err.code === "NoSuchKey") return null;
        throw err;
      });
      if (result?.Body) {
        const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
        const saved = JSON.parse(body.toString("utf-8"));
        merged = { ...merged, ...saved };
      }
    } catch (e: any) {
      console.error("GET: COS read error, using defaults", e);
    }
  }
  merged = { ...merged, ...settings };
  return NextResponse.json({
    success: true,
    oid_partner: merged.oid_partner,
    private_key: merged.private_key,
    paypal_client_id: merged.paypal_client_id,
    paypal_secret: merged.paypal_secret,
    paypal_mode: merged.paypal_mode,
  });
}

export async function POST(request: any) {
  try {
    const body = await request.json();
    settings.oid_partner = body.oid_partner || "";
    settings.private_key = body.private_key || "";
    settings.paypal_client_id = body.paypal_client_id || "";
    settings.paypal_secret = body.paypal_secret || "";
    settings.paypal_mode = body.paypal_mode || "sandbox";
    await saveToCos(settings);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("POST settings error:", e);
    return NextResponse.json({ success: false, error: e.message || String(e) }, { status: 400 });
  }
}
