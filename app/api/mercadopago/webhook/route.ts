import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, productVariants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getMercadoPagoClient, Payment } from "@/lib/mercadopago";
import { sendEmail } from "@/lib/resend";
import { sendTelegramNotification } from "@/lib/telegram";
import { emailPagoAprobado, emailPagoRechazado } from "@/lib/emailTemplates";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Restores stock for all items in an order.
 * Shared logic with the Telegram bot's reject flow.
 */
async function restoreStockForOrder(orderId: string): Promise<void> {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });

  for (const item of items) {
    if (!item.variantId) continue;
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, item.variantId),
    });
    if (variant) {
      await db
        .update(productVariants)
        .set({ stock: variant.stock + item.quantity })
        .where(eq(productVariants.id, variant.id));
    }
  }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Optional signature validation when MERCADOPAGO_WEBHOOK_SECRET is set.
    // MP signs notifications with x-signature header using HMAC-SHA256.
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const xSignature = req.headers.get("x-signature");
      const xRequestId = req.headers.get("x-request-id");
      const dataId = body.data?.id ? String(body.data.id) : "";

      if (xSignature && xRequestId) {
        // MP signature format: "ts=<timestamp>,v1=<hash>"
        const parts = xSignature.split(",");
        const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1] ?? "";
        const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1] ?? "";

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(webhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
        const computed = Buffer.from(signature).toString("hex");

        if (computed !== v1) {
          console.warn("MP webhook: invalid signature");
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      }
    }

    // MP sends different notification types; we only care about "payment"
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(body.data.id);

    // Fetch the real payment status from MP API (never trust the notification body alone)
    const client = getMercadoPagoClient();
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    const mpStatus = payment.status; // "approved" | "rejected" | "pending" | "cancelled" | ...
    const orderId = payment.external_reference;

    if (!orderId) {
      console.warn("MP webhook: payment without external_reference", paymentId);
      return NextResponse.json({ received: true });
    }

    // Load the order
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      console.warn("MP webhook: order not found", orderId);
      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if already in a terminal state from a previous notification
    const terminalStates = ["paid", "cancelled", "refunded", "delivered", "shipped"];
    if (terminalStates.includes(order.status)) {
      return NextResponse.json({ received: true });
    }

    const addr = order.shippingAddress as { name?: string };
    const clientName = addr?.name ?? "Cliente";

    // ── APPROVED ─────────────────────────────────────────────────────────────
    if (mpStatus === "approved") {
      await db
        .update(orders)
        .set({
          status: "paid",
          paymentId: paymentId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Notify Telegram
      await sendTelegramNotification(
        `✅ <b>PAGO APROBADO (MP)</b>\n\n` +
          `Orden <code>${orderId.split("-")[0]}</code> pagada por MercadoPago.\n` +
          `<b>ID Pago:</b> ${paymentId}\n` +
          `<b>Total:</b> $${Number(order.total).toLocaleString("es-CL")}`
      );

      // Email to client
      if (order.guestEmail) {
        await sendEmail({
          to: order.guestEmail,
          subject: "✅ Pago Aprobado — ANTA Indumentaria",
          html: emailPagoAprobado({
            name: clientName,
            orderId,
            total: Number(order.total),
          }),
        });
      }
    }

    // ── REJECTED / CANCELLED ─────────────────────────────────────────────────
    if (mpStatus === "rejected" || mpStatus === "cancelled") {
      await db
        .update(orders)
        .set({
          status: "cancelled",
          paymentId: paymentId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Restore stock
      await restoreStockForOrder(orderId);

      // Notify Telegram
      await sendTelegramNotification(
        `❌ <b>PAGO RECHAZADO (MP)</b>\n\n` +
          `Orden <code>${orderId.split("-")[0]}</code> — status: ${mpStatus}.\n` +
          `Stock devuelto automáticamente.`
      );

      // Email to client
      if (order.guestEmail) {
        await sendEmail({
          to: order.guestEmail,
          subject: "Problema con tu Pago — ANTA Indumentaria",
          html: emailPagoRechazado({
            name: clientName,
            orderId,
          }),
        });
      }
    }

    // "pending" and other states: no action needed — order stays in "processing"

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MP Webhook error:", error);
    // Return 200 to avoid MP retrying immediately; the error is logged
    return NextResponse.json({ received: true, error: "internal" }, { status: 200 });
  }
}
