"use server";

import { db } from "@/lib/db";
import { storeSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStoreSettings(formData: FormData) {
  const heroTitle = formData.get("heroTitle") as string;
  const heroDescription = formData.get("heroDescription") as string;
  const heroCtaText = formData.get("heroCtaText") as string;
  const heroImageUrl = formData.get("heroImageUrl") as string;
  const manifestoTitle = formData.get("manifestoTitle") as string;
  const manifestoDescription = formData.get("manifestoDescription") as string;
  const galleryImage1 = formData.get("galleryImage1") as string;
  const galleryImage2 = formData.get("galleryImage2") as string;

  // Insertar o actualizar
  const existing = await db.query.storeSettings.findFirst();

  if (existing) {
    await db.update(storeSettings)
      .set({
        heroTitle,
        heroDescription,
        heroCtaText,
        heroImageUrl: heroImageUrl || null,
        manifestoTitle,
        manifestoDescription,
        galleryImage1: galleryImage1 || null,
        galleryImage2: galleryImage2 || null,
      })
      .where(eq(storeSettings.id, "default"));
  } else {
    await db.insert(storeSettings).values({
      id: "default",
      heroTitle,
      heroDescription,
      heroCtaText,
      heroImageUrl: heroImageUrl || null,
      manifestoTitle,
      manifestoDescription,
      galleryImage1: galleryImage1 || null,
      galleryImage2: galleryImage2 || null,
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
