-- Migration: Add pre-order, payment tracking, customer name and boleta fields to orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_name" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_pre_order" boolean NOT NULL DEFAULT false;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "amount_paid" numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "boleta_url" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "boleta_sent_at" timestamp;
