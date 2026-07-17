-- Migration: Add shipping configuration fields to store_settings
-- shippingFlatRate: tarifa fija en CLP (0 = gratis siempre)
-- freeShippingThreshold: subtotal mínimo para envío gratis (0 = desactivado)

ALTER TABLE "store_settings" ADD COLUMN IF NOT EXISTS "shipping_flat_rate" integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN IF NOT EXISTS "free_shipping_threshold" integer NOT NULL DEFAULT 0;--> statement-breakpoint
