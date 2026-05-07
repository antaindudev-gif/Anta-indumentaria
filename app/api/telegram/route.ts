import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, productVariants, coupons, products } from "@/lib/schema";
import { eq, lt, and } from "drizzle-orm";
import { sendEmail } from "@/lib/resend";
import { emailPagoAprobado, emailPagoRechazado } from "@/lib/emailTemplates";

const BOT = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function tgSend(chatId: number | string, text: string, extra: object = {}) {
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
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;

    // ─── CALLBACK QUERIES (Botones) ──────────────────────────────────────────
    if (body.callback_query) {
      const cq = body.callback_query;
      const data: string = cq.data;
      const chatId = cq.message.chat.id;

      if (chatId.toString() !== allowedChatId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // ── Aprobar Orden ──
      if (data.startsWith("approve_order_")) {
        const orderId = data.replace("approve_order_", "");
        const orderRecord = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
        if (!orderRecord) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
        await tgEdit(chatId, cq.message.message_id);
        await tgSend(chatId, `✅ Orden <code>${orderId.split('-')[0]}</code> aprobada por ${cq.from.first_name || 'Admin'}. Correo enviado al cliente.`);

        if (orderRecord.guestEmail) {
          const addr = orderRecord.shippingAddress as any;
          await sendEmail({
            to: orderRecord.guestEmail,
            subject: "✅ Pago Aprobado — ANTA Indumentaria",
            html: emailPagoAprobado({ name: addr?.name || 'Cliente', orderId, total: Number(orderRecord.total) }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // ── Rechazar Orden ──
      if (data.startsWith("reject_order_")) {
        const orderId = data.replace("reject_order_", "");
        const orderRecord = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
        if (!orderRecord) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));

        // Devolver stock
        const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, orderId) });
        for (const item of items) {
          if (!item.variantId) continue;
          const variant = await db.query.productVariants.findFirst({ where: eq(productVariants.id, item.variantId) });
          if (variant) {
            await db.update(productVariants).set({ stock: variant.stock + item.quantity }).where(eq(productVariants.id, variant.id));
          }
        }

        await tgEdit(chatId, cq.message.message_id);
        await tgSend(chatId, `❌ Orden <code>${orderId.split('-')[0]}</code> rechazada por ${cq.from.first_name || 'Admin'}. Stock devuelto. Correo enviado al cliente.`);

        if (orderRecord.guestEmail) {
          const addr = orderRecord.shippingAddress as any;
          await sendEmail({
            to: orderRecord.guestEmail,
            subject: "Problema con tu Pago — ANTA Indumentaria",
            html: emailPagoRechazado({ name: addr?.name || 'Cliente', orderId }),
          });
        }
        return NextResponse.json({ success: true });
      }
    }

    // ─── COMANDOS DE TEXTO ───────────────────────────────────────────────────
    if (body.message?.text) {
      const rawText: string = body.message.text.trim();
      const chatId = body.message.chat.id;

      if (chatId.toString() !== allowedChatId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const [command, ...args] = rawText.split(" ");
      const cmd = command.toLowerCase().split("@")[0]; // quitar @botname si viene

      // ── /ventas ──────────────────────────────────────────────────────────
      if (cmd === "/ventas") {
        const paid = await db.query.orders.findMany({ where: eq(orders.status, "paid") });
        const shipped = await db.query.orders.findMany({ where: eq(orders.status, "shipped") });
        const delivered = await db.query.orders.findMany({ where: eq(orders.status, "delivered") });
        const allSales = [...paid, ...shipped, ...delivered];
        const total = allSales.reduce((acc, o) => acc + Number(o.total), 0);
        await tgSend(chatId,
          `📊 <b>REPORTE DE VENTAS</b>\n\n` +
          `💰 <b>Ingreso Total:</b> $${total.toLocaleString("es-CL")}\n` +
          `📦 Pagadas: ${paid.length} · Enviadas: ${shipped.length} · Entregadas: ${delivered.length}\n` +
          `📈 <b>Total Órdenes:</b> ${allSales.length}`
        );
        return NextResponse.json({ success: true });
      }

      // ── /pendientes ──────────────────────────────────────────────────────
      if (cmd === "/pendientes") {
        const pending = await db.query.orders.findMany({ where: eq(orders.status, "pending") });
        if (pending.length === 0) {
          await tgSend(chatId, "✅ No hay órdenes pendientes de aprobación.");
          return NextResponse.json({ success: true });
        }
        let msg = `⏳ <b>ÓRDENES PENDIENTES (${pending.length})</b>\n\n`;
        for (const o of pending.slice(0, 10)) {
          const addr = o.shippingAddress as any;
          msg += `• <code>${o.id.split('-')[0]}</code> — ${addr?.name || o.guestEmail} — <b>$${Number(o.total).toLocaleString("es-CL")}</b>\n`;
          msg += `  <i>/aprobar ${o.id.split('-')[0]} · /cancelar ${o.id.split('-')[0]}</i>\n\n`;
        }
        await tgSend(chatId, msg);
        return NextResponse.json({ success: true });
      }

      // ── /aprobar [id] ────────────────────────────────────────────────────
      if (cmd === "/aprobar") {
        const partialId = args[0];
        if (!partialId) {
          await tgSend(chatId, "⚠️ Uso: <code>/aprobar [primeros-8-digitos-del-id]</code>");
          return NextResponse.json({ success: true });
        }
        const pending = await db.query.orders.findMany({ where: eq(orders.status, "pending") });
        const orderRecord = pending.find(o => o.id.startsWith(partialId) || o.id.split('-')[0] === partialId);

        if (!orderRecord) {
          await tgSend(chatId, `❌ No encontré ninguna orden pendiente con ID <code>${partialId}</code>`);
          return NextResponse.json({ success: true });
        }

        await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderRecord.id));
        await tgSend(chatId, `✅ Orden <code>${orderRecord.id.split('-')[0]}</code> aprobada manualmente. Enviando correo al cliente...`);

        if (orderRecord.guestEmail) {
          const addr = orderRecord.shippingAddress as any;
          await sendEmail({
            to: orderRecord.guestEmail,
            subject: "✅ Pago Aprobado — ANTA Indumentaria",
            html: emailPagoAprobado({ name: addr?.name || 'Cliente', orderId: orderRecord.id, total: Number(orderRecord.total) }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // ── /cancelar [id] ───────────────────────────────────────────────────
      if (cmd === "/cancelar") {
        const partialId = args[0];
        if (!partialId) {
          await tgSend(chatId, "⚠️ Uso: <code>/cancelar [primeros-8-digitos-del-id]</code>");
          return NextResponse.json({ success: true });
        }
        const pending = await db.query.orders.findMany({ where: eq(orders.status, "pending") });
        const orderRecord = pending.find(o => o.id.startsWith(partialId) || o.id.split('-')[0] === partialId);

        if (!orderRecord) {
          await tgSend(chatId, `❌ No encontré ninguna orden pendiente con ID <code>${partialId}</code>`);
          return NextResponse.json({ success: true });
        }

        await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderRecord.id));

        // Devolver stock
        const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, orderRecord.id) });
        for (const item of items) {
          if (!item.variantId) continue;
          const variant = await db.query.productVariants.findFirst({ where: eq(productVariants.id, item.variantId) });
          if (variant) {
            await db.update(productVariants).set({ stock: variant.stock + item.quantity }).where(eq(productVariants.id, variant.id));
          }
        }

        await tgSend(chatId, `❌ Orden <code>${orderRecord.id.split('-')[0]}</code> cancelada. Stock devuelto. Enviando correo al cliente...`);

        if (orderRecord.guestEmail) {
          const addr = orderRecord.shippingAddress as any;
          await sendEmail({
            to: orderRecord.guestEmail,
            subject: "Problema con tu Pago — ANTA Indumentaria",
            html: emailPagoRechazado({ name: addr?.name || 'Cliente', orderId: orderRecord.id }),
          });
        }
        return NextResponse.json({ success: true });
      }

      // ── /stock ───────────────────────────────────────────────────────────
      if (cmd === "/stock") {
        const lowVariants = await db.query.productVariants.findMany({
          with: { product: true }
        });
        const filtered = lowVariants.filter(v => v.stock <= 5).sort((a, b) => a.stock - b.stock);

        if (filtered.length === 0) {
          await tgSend(chatId, "✅ Todo el stock está bien. Ningún producto tiene menos de 5 unidades.");
          return NextResponse.json({ success: true });
        }

        let msg = `📦 <b>ALERTA DE STOCK BAJO (≤5 uds.)</b>\n\n`;
        for (const v of filtered.slice(0, 15)) {
          const icon = v.stock === 0 ? "🔴" : v.stock <= 2 ? "🟠" : "🟡";
          msg += `${icon} <b>${v.product.name}</b> · Talla ${v.size}${v.color ? ` · ${v.color}` : ""} — <b>${v.stock} uds.</b>\n`;
        }
        await tgSend(chatId, msg);
        return NextResponse.json({ success: true });
      }

      // ── /crear_cupon [CODIGO] [porcentaje] ───────────────────────────────
      if (cmd === "/crear_cupon") {
        const [code, percentStr] = args;
        if (!code || !percentStr) {
          await tgSend(chatId, "⚠️ Uso: <code>/crear_cupon CODIGO 20</code> (el número es el % de descuento)");
          return NextResponse.json({ success: true });
        }
        const percent = parseInt(percentStr);
        if (isNaN(percent) || percent < 1 || percent > 100) {
          await tgSend(chatId, "❌ El porcentaje debe ser un número entre 1 y 100.");
          return NextResponse.json({ success: true });
        }

        const existing = await db.query.coupons.findFirst({ where: eq(coupons.code, code.toUpperCase()) });
        if (existing) {
          await tgSend(chatId, `⚠️ El cupón <code>${code.toUpperCase()}</code> ya existe.`);
          return NextResponse.json({ success: true });
        }

        await db.insert(coupons).values({
          code: code.toUpperCase(),
          discountPercentage: percent,
          isActive: true,
        });
        await tgSend(chatId, `✅ Cupón <code>${code.toUpperCase()}</code> creado con <b>${percent}% de descuento</b>. ¡Listo para usar!`);
        return NextResponse.json({ success: true });
      }

      // ── /eliminar_cupon [CODIGO] ─────────────────────────────────────────
      if (cmd === "/eliminar_cupon") {
        const code = args[0];
        if (!code) {
          await tgSend(chatId, "⚠️ Uso: <code>/eliminar_cupon CODIGO</code>");
          return NextResponse.json({ success: true });
        }

        const existing = await db.query.coupons.findFirst({ where: eq(coupons.code, code.toUpperCase()) });
        if (!existing) {
          await tgSend(chatId, `❌ No encontré el cupón <code>${code.toUpperCase()}</code>.`);
          return NextResponse.json({ success: true });
        }

        await db.update(coupons).set({ isActive: false }).where(eq(coupons.code, code.toUpperCase()));
        await tgSend(chatId, `🗑️ Cupón <code>${code.toUpperCase()}</code> desactivado.`);
        return NextResponse.json({ success: true });
      }

      // ── /ayuda ───────────────────────────────────────────────────────────
      if (cmd === "/ayuda") {
        await tgSend(chatId,
          `🤖 <b>ANTA BOT — COMANDOS DISPONIBLES</b>\n\n` +
          `<b>📊 Reportes</b>\n` +
          `/ventas — Ver total de ventas aprobadas\n` +
          `/stock — Ver productos con poco stock\n` +
          `/pendientes — Ver órdenes esperando aprobación\n\n` +
          `<b>✅ Gestión de Órdenes</b>\n` +
          `/aprobar [id] — Aprobar una orden manualmente\n` +
          `/cancelar [id] — Cancelar y devolver stock\n` +
          `(Los primeros 8 caracteres del ID de orden)\n\n` +
          `<b>🎟️ Cupones</b>\n` +
          `/crear_cupon [CODIGO] [%] — Crear un cupón\n` +
          `/eliminar_cupon [CODIGO] — Desactivar un cupón\n\n` +
          `<b>🔔 Notificaciones automáticas</b>\n` +
          `• Nueva orden con transferencia → botones ✅❌\n` +
          `• Agotamiento de stock → alerta automática\n` +
          `• Formulario de contacto → mensaje al grupo`
        );
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
