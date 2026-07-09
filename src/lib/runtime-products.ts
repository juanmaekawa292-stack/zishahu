import fs from "fs";
import path from "path";
import { products as baseProducts, getProductBySlug as baseGetBySlug } from "@/data/products";
import { readOverridesFromCos, writeOverridesToCos } from "@/lib/cos";
import type { Product } from "@/types";

const OVERRIDES_PATH = path.join(process.cwd(), "src/data/overrides.json");

/** Load overrides from local filesystem (sync, fast fallback) */
function loadOverridesSync(): Record<string, Record<string, any>> {
  try {
    const raw = fs.readFileSync(OVERRIDES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Load overrides from COS first, fallback to local filesystem */
async function loadOverrides(): Promise<Record<string, Record<string, any>>> {
  const cosOverrides = await readOverridesFromCos();
  if (cosOverrides && Object.keys(cosOverrides).length > 0) {
    return cosOverrides;
  }
  return loadOverridesSync();
}

/** Save overrides to both COS (for Vercel persistence) and local filesystem */
async function saveOverrides(overrides: Record<string, Record<string, any>>) {
  // Always write to local filesystem
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2), "utf-8");
  // Also try COS (non-blocking)
  try {
    await writeOverridesToCos(overrides);
  } catch {
    // Ignore COS write failures (local dev without COS creds)
  }
}

/** Apply overrides on top of base product */
function applyOverrides(product: Product, overrides: Record<string, any>): Product {
  return { ...product, ...overrides };
}

/** Get all products with runtime overrides applied */
export async function getProducts(): Promise<Product[]> {
  const overrides = await loadOverrides();
  return baseProducts.map((p) => {
    const ov = overrides[p.id];
    return ov ? applyOverrides(p, ov) : p;
  });
}

/** Get single product by slug with runtime overrides */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const overrides = await loadOverrides();
  const base = baseGetBySlug(slug);
  if (!base) return undefined;
  const ov = overrides[base.id];
  return ov ? applyOverrides(base, ov) : base;
}

/** Get single product by ID with runtime overrides */
export async function getProductById(id: string): Promise<Product | undefined> {
  const p = baseProducts.find((x) => x.id === id);
  if (!p) return undefined;
  const overrides = await loadOverrides();
  const ov = overrides[p.id];
  return ov ? applyOverrides(p, ov) : p;
}

/** Update a product field in both overrides and the base products.ts file */
export async function updateProduct(id: string, updates: Record<string, any>) {
  const overrides = await loadOverrides();
  if (!overrides[id]) overrides[id] = {};
  Object.assign(overrides[id], updates);
  await saveOverrides(overrides);
}
