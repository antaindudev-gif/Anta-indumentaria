"use server";

import { db } from "@/lib/db";
import { storeSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "@/lib/s3";
import { getShippingConfig } from "@/lib/shipping";

// ─── Public action: fetch shipping config for checkout ──────────────────────
export { getShippingConfig };

// ─── updateStoreSettings ─────────────────────────────────────────────────────
// Images are uploaded client-side directly to R2 via presigned URLs.
// This action only receives text fields + final image URLs.
export async function updateStoreSettings(formData: FormData) {
  try {
    const heroTitle = formData.get("heroTitle") as string;
    const heroDescription = formData.get("heroDescription") as string;
    const heroCtaText = formData.get("heroCtaText") as string;
    const manifestoTitle = formData.get("manifestoTitle") as string;
    const manifestoDescription = formData.get("manifestoDescription") as string;
    const conceptHeading1 = formData.get("conceptHeading1") as string;
    const conceptText1 = formData.get("conceptText1") as string;
    const conceptHeading2 = formData.get("conceptHeading2") as string;
    const conceptText2 = formData.get("conceptText2") as string;

    // Shipping config
    const shippingFlatRate = Math.max(0, parseInt(formData.get("shippingFlatRate") as string) || 0);
    const freeShippingThreshold = Math.max(0, parseInt(formData.get("freeShippingThreshold") as string) || 0);

    // Image URLs — already uploaded to R2 by the client, or null to keep existing
    const heroImageUrl = (formData.get("heroImageUrl") as string | null) || null;
    const galleryImage1 = (formData.get("galleryImage1") as string | null) || null;
    const galleryImage2 = (formData.get("galleryImage2") as string | null) || null;
    const conceptImage1 = (formData.get("conceptImage1") as string | null) || null;
    const conceptImage2 = (formData.get("conceptImage2") as string | null) || null;

    const existing = await db.query.storeSettings.findFirst();

    // Clean up old images that were replaced (non-blocking)
    const cleanupIfReplaced = (newUrl: string | null, oldUrl: string | null | undefined) => {
      if (newUrl && oldUrl && newUrl !== oldUrl) {
        deleteFromR2(oldUrl).catch((e) => console.warn("Could not delete old image:", oldUrl, e));
      }
    };
    cleanupIfReplaced(heroImageUrl, existing?.heroImageUrl);
    cleanupIfReplaced(galleryImage1, existing?.galleryImage1);
    cleanupIfReplaced(galleryImage2, existing?.galleryImage2);
    cleanupIfReplaced(conceptImage1, existing?.conceptImage1);
    cleanupIfReplaced(conceptImage2, existing?.conceptImage2);

    const payload = {
      heroTitle,
      heroDescription,
      heroCtaText,
      // Keep existing URL if no new one was uploaded
      heroImageUrl: heroImageUrl ?? existing?.heroImageUrl ?? null,
      manifestoTitle,
      manifestoDescription,
      galleryImage1: galleryImage1 ?? existing?.galleryImage1 ?? null,
      galleryImage2: galleryImage2 ?? existing?.galleryImage2 ?? null,
      conceptHeading1,
      conceptText1,
      conceptHeading2,
      conceptText2,
      conceptImage1: conceptImage1 ?? existing?.conceptImage1 ?? null,
      conceptImage2: conceptImage2 ?? existing?.conceptImage2 ?? null,
      shippingFlatRate,
      freeShippingThreshold,
    };

    if (existing) {
      await db.update(storeSettings).set(payload).where(eq(storeSettings.id, "default"));
    } else {
      await db.insert(storeSettings).values({ id: "default", ...payload });
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("updateStoreSettings error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido al guardar";
    throw new Error(message);
  }
}
