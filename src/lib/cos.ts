import COS from "cos-nodejs-sdk-v5";

// COS配置
const SECRET_ID = process.env.COS_SECRET_ID || "";
const SECRET_KEY = process.env.COS_SECRET_KEY || "";
const BUCKET = process.env.COS_BUCKET || "zishahu-images-1301674224";
const REGION = process.env.COS_REGION || "ap-hongkong";
const OVERRIDES_KEY = "products/overrides.json";

let cosInstance: COS | null = null;

function getCos(): COS {
  if (!cosInstance) {
    cosInstance = new COS({
      SecretId: SECRET_ID,
      SecretKey: SECRET_KEY,
    });
  }
  return cosInstance;
}

/** Check if COS credentials are configured */
export function isCosConfigured(): boolean {
  return !!(SECRET_ID && SECRET_KEY);
}

/** Read overrides JSON from COS */
export async function readOverridesFromCos(): Promise<Record<string, Record<string, any>>> {
  if (!isCosConfigured()) return {};
  try {
    const result = await getObjectWithTimeout(
      { Bucket: BUCKET, Region: REGION, Key: OVERRIDES_KEY },
      5000
    ).catch((err: any) => {
      if (err.code === "NoSuchResource" || err.code === "NoSuchKey") return null;
      throw err;
    });

    if (!result || !result.Body) return {};
    const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
    return JSON.parse(body.toString("utf-8"));
  } catch (e) {
    console.error("Failed to read overrides from COS:", e);
    return {};
  }
}

/** Write overrides JSON to COS */
export async function writeOverridesToCos(overrides: Record<string, Record<string, any>>): Promise<boolean> {
  if (!isCosConfigured()) return false;
  try {
    await putObjectWithTimeout(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: OVERRIDES_KEY,
        Body: JSON.stringify(overrides, null, 2),
        ContentType: "application/json",
        CacheControl: "no-cache, no-store, must-revalidate",
      },
      8000
    );
    return true;
  } catch (e) {
    console.error("Failed to write overrides to COS:", e);
    return false;
  }
}

/** Get the COS URL for the overrides file (for direct fetching) */
export function getOverridesCosUrl(): string {
  return `https://${BUCKET}.cos.${REGION}.myqcloud.com/${OVERRIDES_KEY}`;
}

/**
 * Timeout wrapper for COS getObject — adds a configurable timeout to prevent indefinite hanging on Vercel cold starts.
 */ 
async function getObjectWithTimeout(params: any, timeoutMs = 5000): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`COS getObject timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    try {
      getCos().getObject(params, (err: any, data: any) => {
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
 * Timeout wrapper for COS putObject — same timeout pattern.
 */
async function putObjectWithTimeout(params: any, timeoutMs = 8000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`COS putObject timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    try {
      getCos().putObject(params, (err: any) => {
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
 
 /**
  * Generic: read any JSON object from COS by key path
  */
 export async function readJsonFromCos<T = any>(cosKey: string): Promise<T | null> {
   if (!isCosConfigured()) return null;
   try {
    const result = await getObjectWithTimeout(
      { Bucket: BUCKET, Region: REGION, Key: cosKey },
      5000
    ).catch((err: any) => {
      if (err.code === "NoSuchResource" || err.code === "NoSuchKey") return null;
      throw err;
    });
    if (!result || !result.Body) return null;
    const body = result.Body instanceof Buffer ? result.Body : Buffer.from(result.Body);
    return JSON.parse(body.toString("utf-8"));
  } catch (e) {
    console.error(`Failed to read ${cosKey} from COS:`, e);
    return null;
  }
 }
 
 /**
  * Generic: write any JSON object to COS by key path
  */
 export async function writeJsonToCos(cosKey: string, data: any): Promise<boolean> {
   if (!isCosConfigured()) return false;
   try {
    await putObjectWithTimeout(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: cosKey,
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json",
        CacheControl: "no-cache, no-store, must-revalidate",
      },
      8000
    );
    return true;
  } catch (e) {
    console.error(`Failed to write ${cosKey} to COS:`, e);
    return false;
  }
 }
 
 /** COS key for orders storage */
 export const ORDERS_COS_KEY = "orders/orders.json";
 
 /** COS key for payment settings */
 export const PAYMENT_SETTINGS_COS_KEY = "payment/settings.json";
