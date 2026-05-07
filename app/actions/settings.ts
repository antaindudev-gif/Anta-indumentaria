"use server";

import { db } from "@/lib/db";
import { storeSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadToR2, deleteFromR2 } from "@/lib/s3";
import sharp from "sharp";

async function processAndUploadImage(file: File | null, oldUrl: string | null): Promise<string | null> {
  if (!file || file.size === 0) return oldUrl;

  // Process with sharp
  const buffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
  
  // Create unique filename
  const filename = `home/${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
  const newUrl = await uploadToR2(webpBuffer, filename);

  // Delete old image if exists
  if (oldUrl) {
    await deleteFromR2(oldUrl);
  }

  return newUrl;
}

export async function updateStoreSettings(formData: FormData) {
  const heroTitle = formData.get("heroTitle") as string;
  const heroDescription = formData.get("heroDescription") as string;
  const heroCtaText = formData.get("heroCtaText") as string;
  const manifestoTitle = formData.get("manifestoTitle") as string;
  const manifestoDescription = formData.get("manifestoDescription") as string;
  const conceptHeading1 = formData.get("conceptHeading1") as string;
  const conceptText1 = formData.get("conceptText1") as string;
  const conceptHeading2 = formData.get("conceptHeading2") as string;
  const conceptText2 = formData.get("conceptText2") as string;

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
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
