"use server";

import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadToR2, deleteFromR2 } from "@/lib/s3";
import sharp from "sharp";
import { redirect } from "next/navigation";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function processImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(buffer).resize(1200, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  const filename = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  return uploadToR2(webpBuffer, filename);
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const compareAtPrice = formData.get("compareAtPrice") as string;
  const category = formData.get("category") as string;
  const status = (formData.get("status") as string) || "draft";
  const featured = formData.get("featured") === "on";
  const sizes = formData.get("sizes") as string;

  // Process image
  const imageFile = formData.get("imageFile") as File | null;
  const imageUrl = await processImageFile(imageFile);
  const images = imageUrl ? [imageUrl] : [];

  const slug = generateSlug(name);

  const [product] = await db
    .insert(products)
    .values({
      name,
      slug,
      description,
      price,
      compareAtPrice: compareAtPrice || null,
      category: category as "tops" | "bottoms" | "outerwear" | "accessories",
      status: status as "active" | "draft" | "archived",
      featured,
      images,
    })
    .returning();

  // Create variants from sizes
  if (sizes) {
    const sizeList = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    for (const size of sizeList) {
      await db.insert(productVariants).values({
        productId: product.id,
        size,
        stock: 0,
        sku: `ANTA-${slug.toUpperCase().slice(0, 8)}-${size.toUpperCase()}`,
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const compareAtPrice = formData.get("compareAtPrice") as string;
  const category = formData.get("category") as string;
  const status = (formData.get("status") as string) || "draft";
  const featured = formData.get("featured") === "on";

  const existing = await db.query.products.findFirst({ where: eq(products.id, productId) });
  if (!existing) throw new Error("Product not found");

  // Process new image if uploaded
  const imageFile = formData.get("imageFile") as File | null;
  let images = existing.images as string[];

  if (imageFile && imageFile.size > 0) {
    const newUrl = await processImageFile(imageFile);
    // Delete old images
    if (Array.isArray(images)) {
      for (const oldUrl of images) {
        await deleteFromR2(oldUrl);
      }
    }
    images = newUrl ? [newUrl] : [];
  }

  const slug = generateSlug(name);

  await db
    .update(products)
    .set({
      name,
      slug,
      description,
      price,
      compareAtPrice: compareAtPrice || null,
      category: category as "tops" | "bottoms" | "outerwear" | "accessories",
      status: status as "active" | "draft" | "archived",
      featured,
      images,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const productId = formData.get("productId") as string;

  const existing = await db.query.products.findFirst({ where: eq(products.id, productId) });
  if (!existing) throw new Error("Product not found");

  // Delete images from R2
  const images = existing.images as string[];
  if (Array.isArray(images)) {
    for (const url of images) {
      await deleteFromR2(url);
    }
  }

  // Variants are cascade-deleted
  await db.delete(products).where(eq(products.id, productId));

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}
