import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, productVariants, coupons } from "@/lib/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { sendEmail } from "@/lib/resend";
import {
  emailPagoAprobado,
  emailPagoRechazado,
  emailBoleta,
} from "@/lib/emailTemplates";
import { downloadTelegramFile } from "@/lib/telegram";
import { uploadToR2 } from "@/lib/s3";
import { updateOrderStatus } from "@/app/actions/orders";

const BOT = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function tgSend(
  chatId: number | string,
  text: string,
  extra: object = {}
) {
  await fetch(`${BOT}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
  });
}

async function tgEdit(chatId: number | string, messageId: number) {
  await fetch(`${BOT}/editMessageReplyMarkup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [] },
    }),
  });
}

/** Restore stock for all items in an order */
async function restoreStock(orderId: string) {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });
  for (const item of items) {
    if (!item.variantId) continue;
    const v = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, item.variantId),
    });
    if (v) {
      await db
        .update(productVariants)
        .set({ stock: v.stock + item.quantity })
        .where(eq(productVariants.id, v.id));
    }
  }
}

/** Find an order by partial ID (first 8 chars of UUID) or full UUID */
async function findOrderByPartialId(partialId: string) {
  // Sanitize: only allow hex chars and dashes (UUID characters)
  const safe = partialId.replace(/[^a-f0-9\-]/gi, "");
  if (!safe) return null;

  // Try exact match first (full UUID)
  if (safe.length === 36) {
    return await db.query.orders.findFirst({ where: eq(orders.id, safe) });
  }

  // Prefix match — cast UUID to text for ILIKE to work
  const results = await db.query.orders.findMany({
    where: sql`CAST(${orders.id} AS TEXT) ILIKE ${safe + '%'}`,
    limit: 1,
  });
  return results[0] ?? null;
}

/** Format an order summary line for listings */
function orderLine(o: {
  id: string;
  customerName: string | null;
  guestEmail: string | null;
  status: string;
  total: string;
  isPreOrder: boolean;
  amountPaid: string;
}) {
  const name = o.customerName || o.guestEmail || "Sin nombre";
  const shortId = o.id.split("-")[0];
  const paid = Number(o.amountPaid);
  const total = Number(o.total);
  const saldo = total - paid;
  const preTag = o.isPreOrder ? " 🔖" : "";
  const saldoTag =
    o.isPreOrder && saldo > 0
      ? ` · Saldo: <b>$${saldo.toLocaleString("es-CL")}</b>`
      : "";
  return (
    `👤 <b>${name}</b>${preTag}\n` +
    `   <code>${shortId}</code> · $${total.toLocaleString("es-CL")}${saldoTag}\n` +
    `   Estado: ${o.status}\n`
  );
}

// ─── Security guard (called once at the top of POST) ─────────────────────────

function checkSecret(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true; // not configured → allow (dev mode)
  const received = req.headers.get("x-telegram-bot-api-secret-token");
  return received === expected;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Task 1: Verify webhook secret ──────────────────────────────────────────
  if (!checkSecret(req)) {
    console.warn("Telegram webhook: invalid secret token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;

    // ── CALLBACK QUERIES (inline buttons) ────────────────────────────────────
    if (body.callback_query) {
      const cq = body.callback_query;
      const data: string = cq.data;
      const chatId = cq.message.chat.id;

      if (chatId.toString() !== allowedChatId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Approve order
      if (data.startsWith("approve_order_")) {
        const orderId = data.replace("approve_order_", "");
        const rec = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
        if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const orderTotal = Number(rec.total);
        // Approving a transfer = full payment received
        await db.update(orders).set({
          status: "paid",
          amountPaid: orderTotal.toString(),
          updatedAt: new Date(),
        }).where(eq(orders.id, orderId));

        await tgEdit(chatId, cq.message.message_id);

        const shortId = orderId.split("-")[0];
        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        const boletaReminder = rec.isPreOrder
          ? `\n🔖 Pre-order: abono registrado. Envía la boleta cuando corresponda.`
          : `\n📄 Para emitir boleta: envía la boleta (foto/PDF) con el caption:\n<code>/boleta ${shortId}</code>`;

        await tgSend(
          chatId,
          `✅ <b>${clientName}</b> — orden aprobada por ${cq.from.first_name || "Admin"}.` +
          boletaReminder
        );

        if (rec.guestEmail) {
          await sendEmail({
            to: rec.guestEmail,
            subject: "✅ Pago Aprobado — ANTA Indumentaria",
            html: emailPagoAprobado({ name: clientName, orderId, total: orderTotal }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // Reject order
      if (data.startsWith("reject_order_")) {
        const orderId = data.replace("reject_order_", "");
        const rec = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
        if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await db.update(orders).set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(orders.id, orderId));
        await restoreStock(orderId);
        await tgEdit(chatId, cq.message.message_id);

        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        await tgSend(chatId, `❌ <b>${clientName}</b> — orden rechazada. Stock devuelto.`);

        if (rec.guestEmail) {
          await sendEmail({
            to: rec.guestEmail,
            subject: "Problema con tu Pago — ANTA Indumentaria",
            html: emailPagoRechazado({ name: clientName, orderId }),
          });
        }
        return NextResponse.json({ success: true });
      }
    }

    // ── TEXT COMMANDS ─────────────────────────────────────────────────────────
    if (body.message?.text) {
      const rawText: string = body.message.text.trim();
      const chatId = body.message.chat.id;

      if (chatId.toString() !== allowedChatId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const parts = rawText.split(/\s+/);
      const cmd = parts[0].toLowerCase().split("@")[0];
      const args = parts.slice(1);

      // ── /ventas ────────────────────────────────────────────────────────────
      if (cmd === "/ventas") {
        const paid = await db.query.orders.findMany({ where: eq(orders.status, "paid") });
        const shipped = await db.query.orders.findMany({ where: eq(orders.status, "shipped") });
        const delivered = await db.query.orders.findMany({ where: eq(orders.status, "delivered") });
        const all = [...paid, ...shipped, ...delivered];
        const totalRevenue = all.reduce((a, o) => a + Number(o.total), 0);
        const preOrders = all.filter((o) => o.isPreOrder);
        const pendingSaldo = preOrders.reduce(
          (a, o) => a + Math.max(0, Number(o.total) - Number(o.amountPaid)), 0
        );
        await tgSend(
          chatId,
          `📊 <b>REPORTE DE VENTAS</b>\n\n` +
          `💰 <b>Ingreso total:</b> $${totalRevenue.toLocaleString("es-CL")}\n` +
          `📦 Pagadas: ${paid.length} · Enviadas: ${shipped.length} · Entregadas: ${delivered.length}\n` +
          `📈 <b>Total órdenes:</b> ${all.length}\n` +
          (preOrders.length > 0
            ? `\n🔖 <b>Pre-orders:</b> ${preOrders.length} · Saldo pendiente: $${pendingSaldo.toLocaleString("es-CL")}`
            : "")
        );
        return NextResponse.json({ success: true });
      }

      // ── /pendientes ────────────────────────────────────────────────────────
      if (cmd === "/pendientes") {
        const pending = await db.query.orders.findMany({ where: eq(orders.status, "pending") });
        if (pending.length === 0) {
          await tgSend(chatId, "✅ No hay órdenes pendientes de aprobación.");
          return NextResponse.json({ success: true });
        }
        let msg = `⏳ <b>PENDIENTES (${pending.length})</b>\n\n`;
        for (const o of pending.slice(0, 10)) {
          const name = o.customerName || (o.shippingAddress as any)?.name || o.guestEmail || "?";
          const shortId = o.id.split("-")[0];
          msg +=
            `👤 <b>${name}</b>\n` +
            `   <code>${shortId}</code> · $${Number(o.total).toLocaleString("es-CL")}\n` +
            `   ✅ <code>/aprobar ${shortId}</code>  ❌ <code>/cancelar ${shortId}</code>\n\n`;
        }
        await tgSend(chatId, msg);
        return NextResponse.json({ success: true });
      }

      // ── /aprobar [id] ──────────────────────────────────────────────────────
      if (cmd === "/aprobar") {
        if (!args[0]) {
          await tgSend(chatId, "⚠️ Uso: <code>/aprobar [id]</code>\nBusca el ID con /buscar o /pendientes");
          return NextResponse.json({ success: true });
        }
        const rec = await findOrderByPartialId(args[0]);
        if (!rec || rec.status !== "pending") {
          await tgSend(chatId, `❌ No encontré orden pendiente con ID <code>${args[0]}</code>`);
          return NextResponse.json({ success: true });
        }
        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        const orderTotal = Number(rec.total);
        await db.update(orders).set({
          status: "paid",
          amountPaid: orderTotal.toString(),
          updatedAt: new Date(),
        }).where(eq(orders.id, rec.id));

        const shortId = rec.id.split("-")[0];
        await tgSend(
          chatId,
          `✅ <b>${clientName}</b> — orden aprobada.\n` +
          `📄 Para emitir boleta envía la boleta con caption: <code>/boleta ${shortId}</code>`
        );
        if (rec.guestEmail) {
          await sendEmail({
            to: rec.guestEmail,
            subject: "✅ Pago Aprobado — ANTA Indumentaria",
            html: emailPagoAprobado({ name: clientName, orderId: rec.id, total: orderTotal }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // ── /cancelar [id] ────────────────────────────────────────────────────
      if (cmd === "/cancelar") {
        if (!args[0]) {
          await tgSend(chatId, "⚠️ Uso: <code>/cancelar [id]</code>");
          return NextResponse.json({ success: true });
        }
        const rec = await findOrderByPartialId(args[0]);
        if (!rec || rec.status !== "pending") {
          await tgSend(chatId, `❌ No encontré orden pendiente con ID <code>${args[0]}</code>`);
          return NextResponse.json({ success: true });
        }
        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        await db.update(orders).set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(orders.id, rec.id));
        await restoreStock(rec.id);
        await tgSend(chatId, `❌ <b>${clientName}</b> — orden cancelada. Stock devuelto.`);
        if (rec.guestEmail) {
          await sendEmail({
            to: rec.guestEmail,
            subject: "Problema con tu Pago — ANTA Indumentaria",
            html: emailPagoRechazado({ name: clientName, orderId: rec.id }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // ── /aprobar_mp [id] ───────────────────────────────────────────────────
      // Manually approve a MercadoPago order when webhook fails (only for debugging)
      if (cmd === "/aprobar_mp") {
        if (!args[0]) {
          await tgSend(chatId, "⚠️ Uso: <code>/aprobar_mp [id]</code>\nPara aprobar órdenes MP cuando el webhook no llegó.");
          return NextResponse.json({ success: true });
        }
        const rec = await findOrderByPartialId(args[0]);
        if (!rec || rec.paymentMethod !== "mercadopago") {
          await tgSend(chatId, `❌ No encontré orden de MercadoPago con ID <code>${args[0]}</code>`);
          return NextResponse.json({ success: true });
        }
        if (rec.status === "paid") {
          await tgSend(chatId, `⚠️ Esta orden ya está marcada como pagada.`);
          return NextResponse.json({ success: true });
        }
        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        const orderTotal = Number(rec.total);
        const depositAmount = rec.isPreOrder ? Math.ceil(orderTotal * 0.5) : orderTotal;
        
        await db.update(orders).set({
          status: rec.isPreOrder ? "processing" : "paid",
          amountPaid: depositAmount.toString(),
          updatedAt: new Date(),
        }).where(eq(orders.id, rec.id));

        const shortId = rec.id.split("-")[0];
        await tgSend(
          chatId,
          `✅ <b>${clientName}</b> — orden MP aprobada manualmente.\n` +
          (rec.isPreOrder
            ? `🔖 Pre-order: abono de $${depositAmount.toLocaleString("es-CL")} registrado (50%).\nSaldo: $${(orderTotal - depositAmount).toLocaleString("es-CL")}`
            : `💰 Pago completo: $${orderTotal.toLocaleString("es-CL")}`) +
          `\n\n<i>⚠️ Comando de emergencia — normalmente el webhook automático hace esto.</i>`
        );
        if (rec.guestEmail) {
          await sendEmail({
            to: rec.guestEmail,
            subject: "✅ Pago Aprobado — ANTA Indumentaria",
            html: emailPagoAprobado({ name: clientName, orderId: rec.id, total: orderTotal }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // ── /stock ─────────────────────────────────────────────────────────────
      if (cmd === "/stock") {
        const variants = await db.query.productVariants.findMany({ with: { product: true } });
        const low = variants.filter((v) => v.stock <= 5).sort((a, b) => a.stock - b.stock);
        if (low.length === 0) {
          await tgSend(chatId, "✅ Todo el stock está bien (ningún producto ≤5 unidades).");
          return NextResponse.json({ success: true });
        }
        let msg = `📦 <b>STOCK BAJO (≤5 uds.)</b>\n\n`;
        for (const v of low.slice(0, 15)) {
          const icon = v.stock === 0 ? "🔴" : v.stock <= 2 ? "🟠" : "🟡";
          msg += `${icon} <b>${v.product.name}</b> · Talla ${v.size}${v.color ? ` · ${v.color}` : ""} — <b>${v.stock} uds.</b>\n`;
        }
        await tgSend(chatId, msg);
        return NextResponse.json({ success: true });
      }

      // ── /crear_cupon ───────────────────────────────────────────────────────
      if (cmd === "/crear_cupon") {
        const [code, percentStr] = args;
        if (!code || !percentStr) {
          await tgSend(chatId, "⚠️ Uso: <code>/crear_cupon CODIGO 20</code>");
          return NextResponse.json({ success: true });
        }
        const percent = parseInt(percentStr);
        if (isNaN(percent) || percent < 1 || percent > 100) {
          await tgSend(chatId, "❌ El porcentaje debe ser entre 1 y 100.");
          return NextResponse.json({ success: true });
        }
        const existing = await db.query.coupons.findFirst({ where: eq(coupons.code, code.toUpperCase()) });
        if (existing) {
          await tgSend(chatId, `⚠️ El cupón <code>${code.toUpperCase()}</code> ya existe.`);
          return NextResponse.json({ success: true });
        }
        await db.insert(coupons).values({ code: code.toUpperCase(), discountPercentage: percent, isActive: true });
        await tgSend(chatId, `✅ Cupón <code>${code.toUpperCase()}</code> creado con <b>${percent}% de descuento</b>.`);
        return NextResponse.json({ success: true });
      }

      // ── /eliminar_cupon ────────────────────────────────────────────────────
      if (cmd === "/eliminar_cupon") {
        if (!args[0]) {
          await tgSend(chatId, "⚠️ Uso: <code>/eliminar_cupon CODIGO</code>");
          return NextResponse.json({ success: true });
        }
        const existing = await db.query.coupons.findFirst({ where: eq(coupons.code, args[0].toUpperCase()) });
        if (!existing) {
          await tgSend(chatId, `❌ No encontré el cupón <code>${args[0].toUpperCase()}</code>.`);
          return NextResponse.json({ success: true });
        }
        await db.update(coupons).set({ isActive: false }).where(eq(coupons.code, args[0].toUpperCase()));
        await tgSend(chatId, `🗑️ Cupón <code>${args[0].toUpperCase()}</code> desactivado.`);
        return NextResponse.json({ success: true });
      }

      // ── Task 8: /buscar [nombre] ───────────────────────────────────────────
      // Searches by customerName (case-insensitive, partial match).
      if (cmd === "/buscar") {
        const query = args.join(" ").trim();
        if (!query) {
          await tgSend(chatId, "⚠️ Uso: <code>/buscar Maria González</code>");
          return NextResponse.json({ success: true });
        }
        const results = await db.query.orders.findMany({
          where: ilike(orders.customerName, `%${query}%`),
        });
        if (results.length === 0) {
          await tgSend(chatId, `🔍 No encontré órdenes para "<b>${query}</b>".\n\nPrueba con parte del nombre.`);
          return NextResponse.json({ success: true });
        }
        let msg = `🔍 <b>Resultados para "${query}" (${results.length})</b>\n\n`;
        for (const o of results.slice(0, 8)) {
          const shortId = o.id.split("-")[0];
          const paid = Number(o.amountPaid);
          const total = Number(o.total);
          const saldo = total - paid;
          const preTag = o.isPreOrder ? " 🔖PRE-ORDER" : "";
          const saldoLine = o.isPreOrder && saldo > 0
            ? `   💰 Saldo pendiente: <b>$${saldo.toLocaleString("es-CL")}</b>\n`
            : "";
          const boletaLine = o.boletaUrl ? "   🧾 Boleta emitida\n" : "   📄 Sin boleta\n";
          msg +=
            `👤 <b>${o.customerName || "?"}</b>${preTag}\n` +
            `   <code>${shortId}</code> · $${total.toLocaleString("es-CL")} · ${o.status}\n` +
            saldoLine +
            boletaLine +
            `   /orden_${shortId}\n\n`;
        }
        if (results.length > 8) msg += `<i>...y ${results.length - 8} más. Refina la búsqueda.</i>`;
        await tgSend(chatId, msg);
        return NextResponse.json({ success: true });
      }

      // ── Task 8: /orden [id] — detalle completo ─────────────────────────────
      // Also responds to /orden_XXXXX (clickable from /buscar results)
      if (cmd === "/orden" || cmd.startsWith("/orden_")) {
        const partialId = cmd.startsWith("/orden_") ? cmd.replace("/orden_", "") : args[0];
        if (!partialId) {
          await tgSend(chatId, "⚠️ Uso: <code>/orden [id]</code>");
          return NextResponse.json({ success: true });
        }
        const rec = await findOrderByPartialId(partialId);
        if (!rec) {
          await tgSend(chatId, `❌ No encontré ninguna orden con ID <code>${partialId}</code>`);
          return NextResponse.json({ success: true });
        }
        const addr = rec.shippingAddress as any;
        const shortId = rec.id.split("-")[0];
        const paid = Number(rec.amountPaid);
        const total = Number(rec.total);
        const saldo = total - paid;
        const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, rec.id) });
        let itemsText = "";
        for (const it of items) {
          const snap = it.productSnapshot as any;
          itemsText += `  • ${snap?.name || "?"} T${snap?.size || "?"} x${it.quantity} — $${(Number(it.unitPrice) * it.quantity).toLocaleString("es-CL")}\n`;
        }
        const preBlock = rec.isPreOrder
          ? `\n🔖 <b>PRE-ORDER</b>\n   Abonado: $${paid.toLocaleString("es-CL")} / $${total.toLocaleString("es-CL")}` +
            (saldo > 0 ? `\n   Saldo: <b>$${saldo.toLocaleString("es-CL")}</b>` : "\n   ✅ Pagado en su totalidad")
          : "";
        const boletaBlock = rec.boletaUrl
          ? `\n🧾 Boleta enviada`
          : `\n📄 Sin boleta — envía: <code>/boleta ${shortId}</code>`;
        const trackingBlock = rec.trackingUrl
          ? `\n🚚 Tracking: ${rec.trackingUrl}`
          : "";
        await tgSend(
          chatId,
          `📋 <b>ORDEN ${shortId}</b>\n\n` +
          `👤 <b>${rec.customerName || addr?.name || "?"}</b>\n` +
          `📧 ${rec.guestEmail || "—"}\n` +
          `📍 ${addr?.city || "—"}, ${addr?.region || "—"}\n` +
          `📞 ${addr?.phone || "—"}\n\n` +
          `🛒 <b>Productos:</b>\n${itemsText}\n` +
          `💰 Total: <b>$${total.toLocaleString("es-CL")}</b>` +
          preBlock +
          `\n📌 Estado: <b>${rec.status}</b>` +
          boletaBlock +
          trackingBlock +
          `\n\n<code>${rec.id}</code>`
        );
        return NextResponse.json({ success: true });
      }

      // ── Task 8: /enviado [id] [url-tracking] ──────────────────────────────
      if (cmd === "/enviado") {
        const partialId = args[0];
        const trackingUrl = args[1] ?? null;
        if (!partialId) {
          await tgSend(chatId, "⚠️ Uso: <code>/enviado [id] [url-tracking]</code>\nEjemplo: <code>/enviado abc12345 https://tracking.starken.cl/...</code>");
          return NextResponse.json({ success: true });
        }
        const rec = await findOrderByPartialId(partialId);
        if (!rec) {
          await tgSend(chatId, `❌ No encontré orden con ID <code>${partialId}</code>`);
          return NextResponse.json({ success: true });
        }
        if (!["paid", "processing"].includes(rec.status)) {
          await tgSend(chatId, `⚠️ La orden está en estado <b>${rec.status}</b>. Solo se puede marcar como enviada si está en estado pagado o procesando.`);
          return NextResponse.json({ success: true });
        }
        await updateOrderStatus(rec.id, "shipped", trackingUrl ?? undefined);
        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        await tgSend(
          chatId,
          `📦 <b>${clientName}</b> — marcada como enviada.\n` +
          (trackingUrl ? `🚚 Tracking: ${trackingUrl}\n` : "") +
          `✉️ Correo de envío enviado al cliente.`
        );
        return NextResponse.json({ success: true });
      }

      // ── Task 7: /abono [id] [monto] ────────────────────────────────────────
      // Register a manual cash/transfer payment for a pre-order balance.
      if (cmd === "/abono") {
        const partialId = args[0];
        const montoStr = args[1];
        if (!partialId || !montoStr) {
          await tgSend(chatId, "⚠️ Uso: <code>/abono [id] [monto]</code>\nEjemplo: <code>/abono abc12345 25000</code>");
          return NextResponse.json({ success: true });
        }
        const monto = parseInt(montoStr.replace(/[.,]/g, ""));
        if (isNaN(monto) || monto <= 0) {
          await tgSend(chatId, "❌ El monto debe ser un número positivo. Ejemplo: <code>/abono abc12345 25000</code>");
          return NextResponse.json({ success: true });
        }
        const rec = await findOrderByPartialId(partialId);
        if (!rec) {
          await tgSend(chatId, `❌ No encontré orden con ID <code>${partialId}</code>`);
          return NextResponse.json({ success: true });
        }
        const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
        const total = Number(rec.total);
        const prevPaid = Number(rec.amountPaid ?? 0);
        const newPaid = Math.min(prevPaid + monto, total);
        const saldo = total - newPaid;
        const isFullyPaid = saldo <= 0;

        await db.update(orders).set({
          amountPaid: newPaid.toString(),
          status: isFullyPaid ? "paid" : rec.status,
          updatedAt: new Date(),
        }).where(eq(orders.id, rec.id));

        const shortId = rec.id.split("-")[0];
        if (isFullyPaid) {
          await tgSend(
            chatId,
            `✅ <b>${clientName}</b> — ¡pre-order pagada en su totalidad!\n\n` +
            `Abono registrado: $${monto.toLocaleString("es-CL")}\n` +
            `Total pagado: $${newPaid.toLocaleString("es-CL")} / $${total.toLocaleString("es-CL")}\n\n` +
            `📄 Ahora puedes emitir la boleta:\nEnvía la boleta (foto/PDF) con caption: <code>/boleta ${shortId}</code>`
          );
          // Send payment approved email
          if (rec.guestEmail) {
            await sendEmail({
              to: rec.guestEmail,
              subject: "✅ Pago Completado — ANTA Indumentaria",
              html: emailPagoAprobado({ name: clientName, orderId: rec.id, total }),
            });
          }
        } else {
          await tgSend(
            chatId,
            `💰 <b>${clientName}</b> — abono registrado.\n\n` +
            `Abonado ahora: $${monto.toLocaleString("es-CL")}\n` +
            `Total abonado: $${newPaid.toLocaleString("es-CL")} / $${total.toLocaleString("es-CL")}\n` +
            `Saldo pendiente: <b>$${saldo.toLocaleString("es-CL")}</b>\n\n` +
            `<i>Cuando pague el saldo completo, registra con: /abono ${shortId} ${saldo}</i>`
          );
        }
        return NextResponse.json({ success: true });
      }

      // ── Task 6: /ayuda ─────────────────────────────────────────────────────
      if (cmd === "/ayuda") {
        await tgSend(
          chatId,
          `🤖 <b>ANTA BOT — COMANDOS</b>\n\n` +
          `<b>📊 Reportes</b>\n` +
          `/ventas — Ventas totales + saldos pre-order\n` +
          `/stock — Productos con poco stock\n` +
          `/pendientes — Órdenes esperando aprobación\n\n` +
          `<b>🔍 Búsqueda</b>\n` +
          `/buscar [nombre] — Buscar por nombre del cliente\n` +
          `/orden [id] — Ver detalle completo de una orden\n\n` +
          `<b>✅ Gestión de Órdenes</b>\n` +
          `/aprobar [id] — Aprobar pago por transferencia\n` +
          `/cancelar [id] — Cancelar y devolver stock\n` +
          `/aprobar_mp [id] — ⚠️ Aprobar MP si webhook falló\n` +
          `/enviado [id] [url] — Marcar como enviado\n\n` +
          `<b>🔖 Pre-Orders</b>\n` +
          `/abono [id] [monto] — Registrar abono en efectivo\n\n` +
          `<b>🧾 Boleta</b>\n` +
          `Envía foto/PDF + caption: <code>/boleta [id]</code>\n\n` +
          `<b>🎟️ Cupones</b>\n` +
          `/crear_cupon [CODIGO] [%]\n` +
          `/eliminar_cupon [CODIGO]\n\n` +
          `<b>💡 Tip:</b> Los ID son los primeros 8 caracteres.\n` +
          `Busca por nombre con /buscar para encontrarlos fácil.`
        );
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ success: true });
    }

    // ── Task 6: Document/photo with /boleta [id] caption ─────────────────────
    // The owner sends a photo or PDF to the bot with caption "/boleta [id]"
    if (body.message?.document || body.message?.photo) {
      const chatId = body.message.chat.id;

      if (chatId.toString() !== allowedChatId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const rawCaption: string = (body.message.caption || "").trim();
      const captionParts = rawCaption.split(/\s+/);
      const captionCmd = captionParts[0]?.toLowerCase().split("@")[0];

      if (captionCmd === "/boleta") {
        const partialId = captionParts[1];
        if (!partialId) {
          await tgSend(chatId, "⚠️ Envía la boleta con caption: <code>/boleta [id]</code>");
          return NextResponse.json({ success: true });
        }

        const rec = await findOrderByPartialId(partialId);
        if (!rec) {
          await tgSend(chatId, `❌ No encontré orden con ID <code>${partialId}</code>`);
          return NextResponse.json({ success: true });
        }

        const total = Number(rec.total);
        const paid = Number(rec.amountPaid ?? 0);
        if (paid < total) {
          const saldo = total - paid;
          await tgSend(
            chatId,
            `⚠️ La orden de <b>${rec.customerName || "Cliente"}</b> aún tiene saldo pendiente:\n` +
            `Pagado: $${paid.toLocaleString("es-CL")} / $${total.toLocaleString("es-CL")}\n` +
            `Saldo: <b>$${saldo.toLocaleString("es-CL")}</b>\n\n` +
            `Registra el pago primero con <code>/abono ${partialId} ${saldo}</code>`
          );
          return NextResponse.json({ success: true });
        }

        // Get file_id — prefer document, fallback to largest photo
        let fileId: string;
        if (body.message.document) {
          fileId = body.message.document.file_id;
        } else {
          const photos: any[] = body.message.photo;
          fileId = photos[photos.length - 1].file_id; // largest size
        }

        await tgSend(chatId, `⏳ Procesando boleta para <b>${rec.customerName || "Cliente"}</b>...`);

        try {
          // Download from Telegram
          const { buffer, mimeType, filename } = await downloadTelegramFile(fileId);

          // Upload to R2
          const ext = filename.split(".").pop() ?? "jpg";
          const r2Key = `boletas/${rec.id}-${Date.now()}.${ext}`;
          const boletaUrl = await uploadToR2(buffer, r2Key, mimeType);

          // Mark in DB
          await db.update(orders).set({
            boletaUrl,
            boletaSentAt: new Date(),
            updatedAt: new Date(),
          }).where(eq(orders.id, rec.id));

          // Send email with attachment
          const clientName = rec.customerName || (rec.shippingAddress as any)?.name || "Cliente";
          if (rec.guestEmail) {
            await sendEmail({
              to: rec.guestEmail,
              subject: "🧾 Tu Boleta — ANTA Indumentaria",
              html: emailBoleta({ name: clientName, orderId: rec.id, total, boletaUrl }),
              attachments: [{ filename: `boleta-${rec.id.split("-")[0]}.${ext}`, content: buffer, contentType: mimeType }],
            });
          }

          const shortId = rec.id.split("-")[0];
          await tgSend(
            chatId,
            `🧾 <b>Boleta enviada a ${clientName}</b>\n\n` +
            `📧 Correo: ${rec.guestEmail || "—"}\n` +
            `📎 La boleta va adjunta al correo.\n` +
            `🔗 URL: ${boletaUrl}\n\n` +
            `Orden: <code>${shortId}</code> · $${total.toLocaleString("es-CL")}`
          );
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : String(e);
          console.error("Error procesando boleta:", e);
          await tgSend(chatId, `❌ Error al procesar la boleta: ${errMsg}\nIntenta de nuevo.`);
        }
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
