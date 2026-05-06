"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { uploadToR2 } from "@/lib/s3";
import sharp from "sharp";
// import { redirect } from "next/navigation";
import { sendTelegramNotification } from "@/lib/telegram";

export async function createOrder(formData: FormData) {
  try {
    const itemsStr = formData.get("items") as string;
    const items = JSON.parse(itemsStr);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const rut = formData.get("rut") as string;
    const region = formData.get("region") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;
    const paymentMethod = formData.get("paymentMethod") as any;
    const subtotal = Number(formData.get("subtotal"));
    const shippingCost = Number(formData.get("shippingCost"));
    const total = Number(formData.get("total"));
    
    const receiptFile = formData.get("receiptImage") as File | null;
    let receiptUrl = null;

    if (receiptFile && receiptFile.size > 0) {
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const webpBuffer = await sharp(buffer).resize(1200, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      const filename = `receipts/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      receiptUrl = await uploadToR2(webpBuffer, filename);
    }

    // Insert order
    const [newOrder] = await db.insert(orders).values({
      guestEmail: email,
      status: paymentMethod === "transfer" ? "pending" : "processing",
      paymentMethod,
      subtotal: subtotal.toString(),
      shippingCost: shippingCost.toString(),
      total: total.toString(),
      shippingAddress: { name, phone, rut, region, city, address },
      notes,
      receiptUrl,
    }).returning();

    // Insert items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: (item.price || 0).toString(),
        total: (item.quantity * (item.price || 0)).toString(),
        productSnapshot: item,
      });
    }

    // Enviar a Telegram
    const msg = `🚨 <b>NUEVA ORDEN RECIBIDA</b> 🚨\n\n<b>ID:</b> <code>${newOrder.id}</code>\n<b>Cliente:</b> ${name}\n<b>Total:</b> $${total.toLocaleString("es-CL")}\n<b>Método:</b> ${paymentMethod}\n<b>Email:</b> ${email}`;
    
    // Botones de Telegram
    const inlineKeyboard = [];
    if (paymentMethod === "transfer") {
      inlineKeyboard.push([
        { text: "✅ Aprobar Pago", callback_data: `approve_order_${newOrder.id}` },
        { text: "❌ Rechazar", callback_data: `reject_order_${newOrder.id}` }
      ]);
    }

    await sendTelegramNotification(msg, receiptUrl || undefined, inlineKeyboard);

    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    throw error;
  }
}
