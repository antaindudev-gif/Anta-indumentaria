"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No estás autenticado");
  }

  const rut = formData.get("rut") as string;
  const phone = formData.get("phone") as string;
  const street = formData.get("street") as string;
  const comuna = formData.get("comuna") as string;
  const region = formData.get("region") as string;

  const addressObj = {
    phone,
    street,
    comuna,
    region,
  };

  await db
    .update(users)
    .set({
      rut,
      address: addressObj,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profile");
}
