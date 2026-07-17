-- Migration: Add coupon fields to orders table
-- Adds coupon_code and discount_amount columns to support coupon usage tracking

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(10,2) NOT NULL DEFAULT 0;--> statement-breakpoint
