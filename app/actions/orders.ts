"use server";

import { db } from "@/lib/db";
import { orders, orderItems, productVariants, coupons, products } from "@/lib/schema";
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
  isPreOrder: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyAndPriceItems(items: CartItemInput[]): Promise<VerifiedItem[]> {
  const verified: VerifiedItem[] = [];

  for (const item of items) {
    if (!item.variantId || !item.productId) throw new Error(`Item inválido: falta variantId o productId`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error(`Cantidad inválida para variante ${item.variantId}`);

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, item.variantId),
      with: { product: true },
    });

    if (!variant) throw new Error(`Variante no encontrada: ${item.variantId}`);
    if (variant.productId !== item.productId) throw new Error(`El productId no coincide con la variante ${item.variantId}`);
    if (variant.product.status !== "active") throw new Error(`El producto "${variant.product.name}" no está disponible`);
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
      isPreOrder: variant.product.isPreOrder,
    });
  }

  return verified;
}

// ─── createOrder ──────────────────────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  try {
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

    if (!name || !email || !phone || !region || !city || !address) throw new Error("Faltan campos obligatorios de contacto o envío");
    if (!["mercadopago", "transfer"].includes(paymentMethod)) throw new Error("Método de pago inválido");
    if (!rawItems || rawItems.length === 0) throw new Error("El carrito está vacío");

    const verifiedItems = await verifyAndPriceItems(rawItems);

    // Detect if any item is a pre-order
    const orderIsPreOrder = verifiedItems.some((i) => i.isPreOrder);

    const serverSubtotal = verifiedItems.reduce((acc, i) => acc + i.lineTotal, 0);

    // Coupon
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCodeRaw) {
      const coupon = await db.query.coupons.findFirst({ where: eq(coupons.code, couponCodeRaw) });
      if (!coupon) throw new Error(`El cupón "${couponCodeRaw}" no existe.`);
      if (!coupon.isActive) throw new Error(`El cupón "${couponCodeRaw}" ya no está activo.`);
      discountAmount = Math.round(serverSubtotal * (coupon.discountPercentage / 100));
      appliedCouponCode = coupon.code;
    }

    const serverShippingCost = await getShippingCost(serverSubtotal);
    const serverTotal = Math.max(0, serverSubtotal - discountAmount) + serverShippingCost;

    // Pre-order: the initial payment is 50% of the total (abono).
    // Full orders pay 100%.
    const depositAmount = orderIsPreOrder ? Math.ceil(serverTotal * 0.5) : serverTotal;
    const initialAmountPaid = 0; // set after payment confirmation, not at order creation

    // Receipt upload (transfer only — for the deposit)
    let receiptUrl: string | null = null;
    if (paymentMethod === "transfer") {
      const receiptFile = formData.get("receiptImage") as File | null;
      if (!receiptFile || receiptFile.size === 0) throw new Error("Debes adjuntar el comprobante de transferencia");
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const webpBuffer = await sharp(buffer)
        .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const filename = `receipts/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      receiptUrl = await uploadToR2(webpBuffer, filename);
    }

    // Insert order
    const [newOrder] = await db.insert(orders).values({
      guestEmail: email,
      customerName: name,
      status: paymentMethod === "transfer" ? "pending" : "processing",
      paymentMethod,
      subtotal: serverSubtotal.toString(),
      shippingCost: serverShippingCost.toString(),
      discountAmount: discountAmount.toString(),
      couponCode: appliedCouponCode,
      total: serverTotal.toString(),
      isPreOrder: orderIsPreOrder,
      amountPaid: "0",
      shippingAddress: { name, phone, rut, region, city, address },
      notes,
      receiptUrl,
    }).returning();

    // Insert items and decrement stock
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
          isPreOrder: item.isPreOrder,
        },
      });

      const currentVariant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, item.variantId),
        with: { product: true },
      });
      if (currentVariant) {
        const newStock = Math.max(0, currentVariant.stock - item.quantity);
        await db.update(productVariants).set({ stock: newStock }).where(eq(productVariants.id, item.variantId));
        if (newStock === 0) {
          await sendTelegramNotification(
            `⚠️ <b>STOCK AGOTADO</b>\n\n` +
            `Producto: <b>${currentVariant.product.name}</b> · Talla ${currentVariant.size}\n` +
            `Agotado por la orden <code>${newOrder.id.split("-")[0]}</code>`
          );
        }
      }
    }

    // Telegram notification
    const discountLine = discountAmount > 0 ? `\n<b>Cupón:</b> ${appliedCouponCode} (-$${discountAmount.toLocaleString("es-CL")})` : "";
    const preOrderLine = orderIsPreOrder
      ? `\n🔖 <b>PRE-ORDER</b> — Abono inicial: <b>$${depositAmount.toLocaleString("es-CL")}</b> (50%)\nSaldo restante: $${(serverTotal - depositAmount).toLocaleString("es-CL")}`
      : "";

    // Different notification based on payment method
    if (paymentMethod === "transfer") {
      // Transfer: needs manual approval → send buttons
      const telegramMsg =
        `🚨 <b>NUEVA ORDEN — TRANSFERENCIA</b>\n\n` +
        `<b>👤 Cliente:</b> ${name}\n` +
        `<b>📧 Email:</b> ${email}\n` +
        `<b>ID:</b> <code>${newOrder.id.split("-")[0]}</code>\n` +
        `<b>Subtotal:</b> $${serverSubtotal.toLocaleString("es-CL")}${discountLine}\n` +
        `<b>Total:</b> $${serverTotal.toLocaleString("es-CL")}` +
        preOrderLine +
        `\n\n⏳ <b>Esperando aprobación manual del comprobante</b>`;

      const inlineKeyboard = [
        [
          { text: "✅ Aprobar Pago", callback_data: `approve_order_${newOrder.id}` },
          { text: "❌ Rechazar", callback_data: `reject_order_${newOrder.id}` },
        ],
      ];

      await sendTelegramNotification(telegramMsg, receiptUrl ?? undefined, inlineKeyboard);
    } else {
      // MercadoPago: automatic — NO buttons, just FYI
      const telegramMsg =
        `💳 <b>NUEVA ORDEN — MERCADOPAGO</b>\n\n` +
        `<b>👤 Cliente:</b> ${name}\n` +
        `<b>📧 Email:</b> ${email}\n` +
        `<b>ID:</b> <code>${newOrder.id.split("-")[0]}</code>\n` +
        `<b>Subtotal:</b> $${serverSubtotal.toLocaleString("es-CL")}${discountLine}\n` +
        `<b>Total:</b> $${serverTotal.toLocaleString("es-CL")}` +
        preOrderLine +
        `\n\n⏳ <b>Esperando confirmación de MercadoPago...</b>\n` +
        `<i>El webhook notificará cuando se complete el pago.</i>`;

      await sendTelegramNotification(telegramMsg);
    }

    // Confirmation email (transfer orders)
    if (paymentMethod === "transfer") {
      await sendEmail({
        to: email,
        subject: orderIsPreOrder
          ? `Pre-order recibida — ANTA Indumentaria`
          : `Recibimos tu orden — ANTA Indumentaria`,
        html: emailOrdenRecibida({
          name,
          orderId: newOrder.id,
          total: serverTotal,
          subtotal: serverSubtotal,
          discountAmount,
          couponCode: appliedCouponCode,
          isPreOrder: orderIsPreOrder,
          depositAmount,
          items: verifiedItems.map((i) => ({
            name: i.productName,
            size: i.size,
            quantity: i.quantity,
            price: i.unitPrice,
          })),
        }),
      });
    }

    // MercadoPago: charge only the deposit for pre-orders, full amount otherwise
    if (paymentMethod === "mercadopago") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://antaindumentaria.cl";
      const client = getMercadoPagoClient();
      const preference = new Preference(client);

      const mpItems = verifiedItems.map((item) => ({
        id: item.variantId,
        title: `${item.productName} (Talla ${item.size})${item.isPreOrder ? " [PRE-ORDER 50%]" : ""}`,
        description: item.color ? `Color: ${item.color}` : undefined,
        picture_url: item.image ?? undefined,
        quantity: item.quantity,
        currency_id: "CLP",
        // For pre-orders, charge 50% per item
        unit_price: item.isPreOrder ? Math.ceil(item.unitPrice * 0.5) : item.unitPrice,
      }));

      if (serverShippingCost > 0 && !orderIsPreOrder) {
        mpItems.push({ id: "shipping", title: "Costo de Envío", description: undefined, picture_url: undefined, quantity: 1, currency_id: "CLP", unit_price: serverShippingCost });
      }
      if (discountAmount > 0 && appliedCouponCode) {
        const adjustedDiscount = orderIsPreOrder ? Math.ceil(discountAmount * 0.5) : discountAmount;
        mpItems.push({ id: `coupon-${appliedCouponCode}`, title: `Descuento ${appliedCouponCode}`, description: undefined, picture_url: undefined, quantity: 1, currency_id: "CLP", unit_price: -adjustedDiscount });
      }

      const preferenceData = await preference.create({
        body: {
          external_reference: newOrder.id,
          items: mpItems,
          payer: { name, email },
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

      await db.update(orders).set({ paymentId: preferenceData.id ?? null }).where(eq(orders.id, newOrder.id));

      return { success: true, orderId: newOrder.id, mpInitPoint: preferenceData.init_point ?? null, isPreOrder: orderIsPreOrder, depositAmount };
    }

    return { success: true, orderId: newOrder.id, mpInitPoint: null, isPreOrder: orderIsPreOrder, depositAmount };
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    if (error instanceof Error) throw error;
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
      .set({ status, trackingUrl: trackingUrl ?? null, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    if (status === "shipped") {
      const trackingLine = trackingUrl ? `\n<b>Tracking:</b> ${trackingUrl}` : "";
      await sendTelegramNotification(`📦 <b>ORDEN DESPACHADA</b>\n\nOrden <code>${orderId.split("-")[0]}</code> marcada como enviada.${trackingLine}`);

      const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
      if (order?.guestEmail) {
        const addr = order.shippingAddress as { name?: string };
        await sendEmail({
          to: order.guestEmail,
          subject: "¡Tu pedido está en camino! — ANTA Indumentaria",
          html: emailPedidoEnviado({ name: addr?.name ?? "Cliente", orderId, trackingUrl: trackingUrl ?? null }),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    return { success: false, error: "Error al actualizar la orden" };
  }
}
