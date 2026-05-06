"use server";

import { db } from "@/lib/db";
import { coupons } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  const code = formData.get("code") as string;
  const discountPercentage = parseInt(formData.get("discountPercentage") as string);
  const isActive = formData.get("isActive") === "on";

  await db.insert(coupons).values({
    code: code.toUpperCase(),
    discountPercentage,
    isActive,
  });

  revalidatePath("/admin/coupons");
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  await db.update(coupons).set({ isActive: !currentStatus }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function validateCoupon(code: string) {
  const coupon = await db.query.coupons.findFirst({
    where: eq(coupons.code, code.toUpperCase()),
  });

  if (!coupon) return { error: "Cupón no encontrado." };
  if (!coupon.isActive) return { error: "El cupón ya no está activo." };

  return { success: true, discountPercentage: coupon.discountPercentage };
}
