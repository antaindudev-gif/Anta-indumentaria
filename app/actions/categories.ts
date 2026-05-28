"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) return { error: "Name and slug are required" };

  try {
    await db.insert(categories).values({ name, slug });
    revalidatePath("/admin/products/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create category or slug already exists" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/products/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete category" };
  }
}
