"use server";

import { db } from "@/lib/db";
import { orders, orderItems, productVariants, coupons } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { uploadToR2 } from "@/lib/s3";
import sharp from "sharp";
import { sendTelegramNotification } from "@/lib/telegram";
import { sendEmail } from "@/lib/resend";
import { emailOrdenRecibida, emailPedidoEnviado } from "@/lib/emailTemplates";
import { getShippingCost } from "@/lib/shipping";
import { getMercadoPagoClient, Preference } from "@/lib/mercadopago";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  // These client-side values are ignored for price calculation — we re-read from DB
  name?: string;
  size?: string;
  image?: string | null;
  slug?: string;
  price?: number;
}

interface VerifiedItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productName: string;
  size: string;
  color: string | null;
  image: string | null;
  slug: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Re-reads prices and stock from DB for each item.
 * Throws if any variant is not found or has insufficient stock.
 */
async function verifyAndPriceItems(items: CartItemInput[]): Promise<VerifiedItem[]> {
  const verified: VerifiedItem[] = [];

  for (const item of items) {
    if (!item.variantId || !item.productId) {
      throw new Error(`Item inválido: falta variantId o productId`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error(`Cantidad inválida para variante ${item.variantId}`);
    }

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, item.variantId),
      with: { product: true },
    });

    if (!variant) {
      throw new Error(`Variante no encontrada: ${item.variantId}`);
    }
    if (variant.productId !== item.productId) {
      throw new Error(`El productId no coincide con la variante ${item.variantId}`);
    }
    if (variant.product.status !== "active") {
      throw new Error(`El producto "${variant.product.name}" no está disponible`);
    }
    if (variant.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para "${variant.product.name}" (Talla ${variant.size}). ` +
        `Disponible: ${variant.stock}, solicitado: ${item.quantity}`
      );
    }

    const unitPrice = Number(variant.product.price);
    const images = variant.product.images as string[];

    verified.push({
      productId: variant.productId,
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      productName: variant.product.name,
      size: variant.size,
      color: variant.color ?? null,
      image: images?.[0] ?? null,
      slug: variant.product.slug,
    });
  }

  return verified;
}

// ─── createOrder ──────────────────────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  try {
    // 1. Parse client inputs (used for address/contact only — NOT for pricing)
    const itemsStr = formData.get("items") as string;
    const rawItems: CartItemInput[] = JSON.parse(itemsStr);
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim().toLowerCase();
    const phone = (formData.get("phone") as string).trim();
    const rut = (formData.get("rut") as string | null)?.trim() ?? "";
    const region = (formData.get("region") as string).trim();
    const city = (formData.get("city") as string).trim();
    const address = (formData.get("address") as string).trim();
    const notes = (formData.get("notes") as string | null)?.trim() ?? "";
    const paymentMethod = formData.get("paymentMethod") as "mercadopago" | "transfer";
    const couponCodeRaw = (formData.get("couponCode") as string | null)?.trim().toUpperCase() || null;

    // Basic input validation
    if (!name || !email || !phone || !region || !city || !address) {
      throw new Error("Faltan campos obligatorios de contacto o envío");
    }
    if (!["mercadopago", "transfer"].includes(paymentMethod)) {
      throw new Error("Método de pago inválido");
    }
    if (!rawItems || rawItems.length === 0) {
      throw new Error("El carrito está vacío");
    }

    // 2. Verify items against DB — prices and stock are authoritative from here
    const verifiedItems = await verifyAndPriceItems(rawItems);

    // 3. Calculate totals server-side (ignore client-sent subtotal/shippingCost/total)
    const serverSubtotal = verifiedItems.reduce((acc, i) => acc + i.lineTotal, 0);

    // 3a. Validate coupon server-side if provided
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCodeRaw) {
      const coupon = await db.query.coupons.findFirst({
        where: eq(coupons.code, couponCodeRaw),
      });
      if (!coupon) {
        throw new Error(`El cupón "${couponCodeRaw}" no existe.`);
      }
      if (!coupon.isActive) {
        throw new Error(`El cupón "${couponCodeRaw}" ya no está activo.`);
      }
      // Apply percentage discount over subtotal (rounded to integer CLP)
      discountAmount = Math.round(serverSubtotal * (coupon.discountPercentage / 100));
      appliedCouponCode = coupon.code;
    }

    // Shipping cost: read from store_settings config
    const serverShippingCost = await getShippingCost(serverSubtotal);
    const serverTotal = Math.max(0, serverSubtotal - discountAmount) + serverShippingCost;

    // 4. Handle receipt upload (transfer only)
    let receiptUrl: string | null = null;
    if (paymentMethod === "transfer") {
      const receiptFile = formData.get("receiptImage") as File | null;
      if (!receiptFile || receiptFile.size === 0) {
        throw new Error("Debes adjuntar el comprobante de transferencia");
      }
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const webpBuffer = await sharp(buffer)
        .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const filename = `receipts/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      receiptUrl = await uploadToR2(webpBuffer, filename);
    }

    // 5. Insert order (status pending for transfer, processing for MP until webhook confirms)
    const [newOrder] = await db.insert(orders).values({
      guestEmail: email,
      status: paymentMethod === "transfer" ? "pending" : "processing",
      paymentMethod,
      subtotal: serverSubtotal.toString(),
      shippingCost: serverShippingCost.toString(),
      discountAmount: discountAmount.toString(),
      couponCode: appliedCouponCode,
      total: serverTotal.toString(),
      shippingAddress: { name, phone, rut, region, city, address },
      notes,
      receiptUrl,
    }).returning();

    // 6. Insert order items and decrement stock
    for (const item of verifiedItems) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.lineTotal.toString(),
        productSnapshot: {
          name: item.productName,
          size: item.size,
          color: item.color,
          image: item.image,
          slug: item.slug,
          price: item.unitPrice,
        },
      });

      // Decrement stock (already validated — no race condition guard needed for MVP)
      const currentVariant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, item.variantId),
        with: { product: true },
      });

      if (currentVariant) {
        const newStock = Math.max(0, currentVariant.stock - item.quantity);
        await db.update(productVariants)
          .set({ stock: newStock })
          .where(eq(productVariants.id, item.variantId));

        if (newStock === 0) {
          const alertMsg =
            `⚠️ <b>STOCK AGOTADO</b>\n\n` +
            `Producto: <b>${currentVariant.product.name}</b> · Talla ${currentVariant.size}\n` +
            `Agotado por la orden <code>${newOrder.id.split("-")[0]}</code>`;
          await sendTelegramNotification(alertMsg);
        }
      }
    }

    // 7. Notify Telegram
    const discountLine = discountAmount > 0
      ? `\n<b>Cupón:</b> ${appliedCouponCode} (-$${discountAmount.toLocaleString("es-CL")})`
      : "";
    const telegramMsg =
      `🚨 <b>NUEVA ORDEN RECIBIDA</b>\n\n` +
      `<b>ID:</b> <code>${newOrder.id}</code>\n` +
      `<b>Cliente:</b> ${name}\n` +
      `<b>Subtotal:</b> $${serverSubtotal.toLocaleString("es-CL")}${discountLine}\n` +
      `<b>Total:</b> $${serverTotal.toLocaleString("es-CL")}\n` +
      `<b>Método:</b> ${paymentMethod === "transfer" ? "Transferencia" : "MercadoPago"}\n` +
      `<b>Email:</b> ${email}`;

    const inlineKeyboard: Array<Array<{ text: string; callback_data: string }>> = [];
    if (paymentMethod === "transfer") {
      inlineKeyboard.push([
        { text: "✅ Aprobar Pago", callback_data: `approve_order_${newOrder.id}` },
        { text: "❌ Rechazar", callback_data: `reject_order_${newOrder.id}` },
      ]);
    }

    await sendTelegramNotification(telegramMsg, receiptUrl ?? undefined, inlineKeyboard);

    // 8. Send confirmation email for transfer orders
    if (paymentMethod === "transfer") {
      await sendEmail({
        to: email,
        subject: "Recibimos tu orden — ANTA Indumentaria",
        html: emailOrdenRecibida({
          name,
          orderId: newOrder.id,
          total: serverTotal,
          subtotal: serverSubtotal,
          discountAmount,
          couponCode: appliedCouponCode,
          items: verifiedItems.map((i) => ({
            name: i.productName,
            size: i.size,
            quantity: i.quantity,
            price: i.unitPrice,
          })),
        }),
      });
    }

    // 9. Create MercadoPago preference for online payment
    if (paymentMethod === "mercadopago") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://antaindumentaria.cl";
      const client = getMercadoPagoClient();
      const preference = new Preference(client);

      // Build items array — MP requires unit_price in the currency of the account (CLP)
      const mpItems = verifiedItems.map((item) => ({
        id: item.variantId,
        title: `${item.productName} (Talla ${item.size})`,
        description: item.color ? `Color: ${item.color}` : undefined,
        picture_url: item.image ?? undefined,
        quantity: item.quantity,
        currency_id: "CLP",
        unit_price: item.unitPrice,
      }));

      // Add shipping as a separate item if > 0 (MP doesn't have a native shipping field in Checkout Pro)
      if (serverShippingCost > 0) {
        mpItems.push({
          id: "shipping",
          title: "Costo de Envío",
          description: undefined,
          picture_url: undefined,
          quantity: 1,
          currency_id: "CLP",
          unit_price: serverShippingCost,
        });
      }

      // Add discount as a negative item if coupon applied
      // MP Checkout Pro supports negative unit_price for discounts
      if (discountAmount > 0 && appliedCouponCode) {
        mpItems.push({
          id: `coupon-${appliedCouponCode}`,
          title: `Descuento cupón ${appliedCouponCode}`,
          description: undefined,
          picture_url: undefined,
          quantity: 1,
          currency_id: "CLP",
          unit_price: -discountAmount,
        });
      }

      const preferenceData = await preference.create({
        body: {
          external_reference: newOrder.id,
          items: mpItems,
          payer: {
            name,
            email,
          },
          back_urls: {
            success: `${baseUrl}/order-confirmation/${newOrder.id}?status=success`,
            failure: `${baseUrl}/order-confirmation/${newOrder.id}?status=failure`,
            pending: `${baseUrl}/order-confirmation/${newOrder.id}?status=pending`,
          },
          auto_return: "approved",
          notification_url: `${baseUrl}/api/mercadopago/webhook`,
          statement_descriptor: "ANTA Indumentaria",
        },
      });

      // Persist the MP preference id on the order
      await db.update(orders)
        .set({ paymentId: preferenceData.id ?? null })
        .where(eq(orders.id, newOrder.id));

      return {
        success: true,
        orderId: newOrder.id,
        mpInitPoint: preferenceData.init_point ?? null,
      };
    }

    return { success: true, orderId: newOrder.id, mpInitPoint: null };
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    // Re-throw with a user-friendly message for known validation errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al procesar la orden. Intenta de nuevo.");
  }
}

// ─── updateOrderStatus ────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
  trackingUrl?: string
) {
  try {
    await db.update(orders)
      .set({
        status,
        trackingUrl: trackingUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Notify Telegram when shipped
    if (status === "shipped") {
      const trackingLine = trackingUrl ? `\n<b>Tracking:</b> ${trackingUrl}` : "";
      const msg =
        `📦 <b>ORDEN DESPACHADA</b>\n\n` +
        `Orden <code>${orderId.split("-")[0]}</code> marcada como enviada.${trackingLine}`;
      await sendTelegramNotification(msg);
    }

    // Send email to customer when shipped
    if (status === "shipped") {
      const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
      if (order?.guestEmail) {
        const addr = order.shippingAddress as { name?: string };
        await sendEmail({
          to: order.guestEmail,
          subject: "¡Tu pedido está en camino! — ANTA Indumentaria",
          html: emailPedidoEnviado({
            name: addr?.name ?? "Cliente",
            orderId,
            trackingUrl: trackingUrl ?? null,
          }),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    return { success: false, error: "Error al actualizar la orden" };
  }
}
