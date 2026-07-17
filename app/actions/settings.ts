"use server";

import { db } from "@/lib/db";
import { storeSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadToR2, deleteFromR2 } from "@/lib/s3";
import sharp from "sharp";
import { getShippingConfig } from "@/lib/shipping";

// ─── Public action: fetch shipping config for checkout ──────────────────────
export { getShippingConfig };

async function processAndUploadImage(file: File | null, oldUrl: string | null): Promise<string | null> {
  if (!file || file.size === 0) return oldUrl;

  try {
    // Process with sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    
    // Create unique filename
    const filename = `home/${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const newUrl = await uploadToR2(webpBuffer, filename);

    // Delete old image if exists (non-blocking — don't fail the upload if delete fails)
    if (oldUrl) {
      deleteFromR2(oldUrl).catch((e) => console.warn("Could not delete old image:", oldUrl, e));
    }

    return newUrl;
  } catch (error) {
    console.error(`processAndUploadImage failed for file "${file.name}" (${file.size} bytes):`, error);
    throw new Error(`Error al subir la imagen "${file.name}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

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

  const existing = await db.query.storeSettings.findFirst();

  // Process files
  const heroImageFile = formData.get("heroImageFile") as File | null;
  const galleryImage1File = formData.get("galleryImage1File") as File | null;
  const galleryImage2File = formData.get("galleryImage2File") as File | null;
  const conceptImage1File = formData.get("conceptImage1File") as File | null;
  const conceptImage2File = formData.get("conceptImage2File") as File | null;

  const finalHeroImageUrl = await processAndUploadImage(heroImageFile, existing?.heroImageUrl || null);
  const finalGalleryImage1 = await processAndUploadImage(galleryImage1File, existing?.galleryImage1 || null);
  const finalGalleryImage2 = await processAndUploadImage(galleryImage2File, existing?.galleryImage2 || null);
  const finalConceptImage1 = await processAndUploadImage(conceptImage1File, (existing as any)?.conceptImage1 || null);
  const finalConceptImage2 = await processAndUploadImage(conceptImage2File, (existing as any)?.conceptImage2 || null);

  if (existing) {
    await db.update(storeSettings)
      .set({
        heroTitle,
        heroDescription,
        heroCtaText,
        heroImageUrl: finalHeroImageUrl,
        manifestoTitle,
        manifestoDescription,
        galleryImage1: finalGalleryImage1,
        galleryImage2: finalGalleryImage2,
        conceptHeading1,
        conceptText1,
        conceptHeading2,
        conceptText2,
        conceptImage1: finalConceptImage1,
        conceptImage2: finalConceptImage2,
        shippingFlatRate,
        freeShippingThreshold,
      })
      .where(eq(storeSettings.id, "default"));
  } else {
    await db.insert(storeSettings).values({
      id: "default",
      heroTitle,
      heroDescription,
      heroCtaText,
      heroImageUrl: finalHeroImageUrl,
      manifestoTitle,
      manifestoDescription,
      galleryImage1: finalGalleryImage1,
      galleryImage2: finalGalleryImage2,
      conceptHeading1,
      conceptText1,
      conceptHeading2,
      conceptText2,
      conceptImage1: finalConceptImage1,
      conceptImage2: finalConceptImage2,
      shippingFlatRate,
      freeShippingThreshold,
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
  } catch (error) {
    console.error("updateStoreSettings error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido al guardar la configuración";
    throw new Error(message);
  }
}
