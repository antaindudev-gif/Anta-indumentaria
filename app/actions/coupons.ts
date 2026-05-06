"use server";

import { db } from "@/lib/db";
import { coupons } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(50, "Código muy largo"),
  discountPercentage: z.coerce.number().min(1, "El descuento mínimo es 1%").max(100, "El descuento máximo es 100%"),
});

export async function createCoupon(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  const validated = couponSchema.parse({
    code: formData.get("code"),
    discountPercentage: formData.get("discountPercentage"),
  });

  const isActive = formData.get("isActive") === "on";

  await db.insert(coupons).values({
    code: validated.code.toUpperCase().replace(/\s+/g, ""),
    discountPercentage: validated.discountPercentage,
    isActive,
  });

  revalidatePath("/admin/coupons");
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  await db.update(coupons).set({ isActive: !currentStatus }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

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
