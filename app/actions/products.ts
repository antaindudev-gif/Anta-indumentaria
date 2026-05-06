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
  const category = formData.get("category") as any;
  const status = (formData.get("status") as any) || "draft";
  const featured = formData.get("featured") === "on";
  const isSale = formData.get("isSale") === "on";
  const isPreOrder = formData.get("isPreOrder") === "on";
  const sizes = formData.get("sizes") as string;
  const colors = formData.get("colors") as string;

  // Process images
  const imageFile = formData.get("imageFile") as File | null;
  const galleryFiles = formData.getAll("galleryFiles") as File[];
  
  const images = [];
  
  if (imageFile && imageFile.size > 0) {
    const url = await processImageFile(imageFile);
    if (url) images.push(url);
  }
  
  const validGallery = galleryFiles.filter((f) => f.size > 0);
  for (const file of validGallery) {
    const url = await processImageFile(file);
    if (url) images.push(url);
  }

  const slug = generateSlug(name);

  const [product] = await db
    .insert(products)
    .values({
      name,
      slug,
      description,
      price,
      compareAtPrice: compareAtPrice || null,
      category,
      status,
      featured,
      isSale,
      isPreOrder,
      images,
    })
    .returning();

  // Create variants from sizes and colors
  if (sizes) {
    const sizeList = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colorList = colors ? colors.split(",").map((c) => c.trim()).filter(Boolean) : [""];

    for (const size of sizeList) {
      for (const color of colorList) {
        let skuSuffix = size.toUpperCase();
        if (color) skuSuffix += `-${color.substring(0, 3).toUpperCase()}`;

        await db.insert(productVariants).values({
          productId: product.id,
          size,
          color: color || null,
          stock: 0,
          sku: `ANTA-${slug.toUpperCase().slice(0, 8)}-${skuSuffix}`,
        });
      }
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
  const category = formData.get("category") as any;
  const status = (formData.get("status") as any) || "draft";
  const featured = formData.get("featured") === "on";
  const isSale = formData.get("isSale") === "on";
  const isPreOrder = formData.get("isPreOrder") === "on";

  const existing = await db.query.products.findFirst({ where: eq(products.id, productId) });
  if (!existing) throw new Error("Product not found");

  // Process new images if uploaded
  const imageFile = formData.get("imageFile") as File | null;
  const galleryFiles = formData.getAll("galleryFiles") as File[];
  const validGallery = galleryFiles.filter(f => f.size > 0);
  
  let images = existing.images as string[];

  // If a new cover image is uploaded or new gallery files are uploaded
  if ((imageFile && imageFile.size > 0) || validGallery.length > 0) {
    const newImages = [];
    
    // Process cover image
    if (imageFile && imageFile.size > 0) {
      const url = await processImageFile(imageFile);
      if (url) newImages.push(url);
    } else if (images.length > 0) {
      // Keep existing cover if not updated
      newImages.push(images[0]);
    }

    // Process gallery images
    if (validGallery.length > 0) {
      for (const file of validGallery) {
        const url = await processImageFile(file);
        if (url) newImages.push(url);
      }
    } else {
      // Keep existing gallery if not updated
      newImages.push(...images.slice(1));
    }

    // Identify which old images were removed and delete from R2
    if (Array.isArray(images)) {
      for (const oldUrl of images) {
        if (!newImages.includes(oldUrl)) {
          await deleteFromR2(oldUrl);
        }
      }
    }
    
    images = newImages;
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
      category,
      status,
      featured,
      isSale,
      isPreOrder,
      images,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  // Process variants updates
  const variantsDataStr = formData.get("variantsData") as string;
  if (variantsDataStr) {
    const parsedVariants = JSON.parse(variantsDataStr);
    
    // Get existing variants
    const existingVariants = await db.query.productVariants.findMany({ where: eq(productVariants.productId, productId) });
    const parsedIds = parsedVariants.map((v: any) => v.id).filter(Boolean);

    // Delete variants that were removed
    for (const ex of existingVariants) {
      if (!parsedIds.includes(ex.id)) {
        await db.delete(productVariants).where(eq(productVariants.id, ex.id));
      }
    }

    // Insert or update remaining variants
    for (const pv of parsedVariants) {
      if (pv.id) {
        await db.update(productVariants).set({
          size: pv.size,
          color: pv.color || null,
          stock: Number(pv.stock),
        }).where(eq(productVariants.id, pv.id));
      } else {
        // Insert new variant added during edit
        let skuSuffix = pv.size.toUpperCase();
        if (pv.color) skuSuffix += `-${pv.color.substring(0, 3).toUpperCase()}`;
        skuSuffix += `-${Math.floor(Math.random()*1000)}`;
        
        await db.insert(productVariants).values({
          productId: productId,
          size: pv.size,
          color: pv.color || null,
          stock: Number(pv.stock),
          sku: `ANTA-${slug.toUpperCase().slice(0, 8)}-${skuSuffix}`,
        });
      }
    }
  }

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
