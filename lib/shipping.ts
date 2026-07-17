import { db } from "@/lib/db";

// Default fallback config — used if store_settings row doesn't exist yet
const SHIPPING_DEFAULTS = {
  shippingFlatRate: 0,
  freeShippingThreshold: 0,
};

/**
 * Reads shipping config from store_settings and calculates the shipping cost
 * for a given subtotal (in CLP).
 *
 * Rules:
 * - If freeShippingThreshold > 0 and subtotal >= threshold → free shipping
 * - Otherwise → shippingFlatRate (can be 0 for always-free)
 */
export async function getShippingCost(subtotalCLP: number): Promise<number> {
  const settings = await db.query.storeSettings.findFirst();
  const flatRate = settings?.shippingFlatRate ?? SHIPPING_DEFAULTS.shippingFlatRate;
  const threshold = settings?.freeShippingThreshold ?? SHIPPING_DEFAULTS.freeShippingThreshold;

  if (threshold > 0 && subtotalCLP >= threshold) {
    return 0; // Free shipping threshold reached
  }

  return flatRate;
}

/**
 * Returns the raw shipping config for display purposes in the checkout UI.
 */
export async function getShippingConfig(): Promise<{
  shippingFlatRate: number;
  freeShippingThreshold: number;
}> {
  const settings = await db.query.storeSettings.findFirst();
  return {
    shippingFlatRate: settings?.shippingFlatRate ?? SHIPPING_DEFAULTS.shippingFlatRate,
    freeShippingThreshold: settings?.freeShippingThreshold ?? SHIPPING_DEFAULTS.freeShippingThreshold,
  };
}
