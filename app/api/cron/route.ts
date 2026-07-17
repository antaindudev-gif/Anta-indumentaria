import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, isNull, or, inArray } from "drizzle-orm";
import { sendTelegramNotification } from "@/lib/telegram";

// Vercel Cron — called daily at 09:00 Chile time (UTC-3 → 12:00 UTC)
// vercel.json configures the schedule; this endpoint verifies CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── 1. Resumen de ventas del día ────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await db.query.orders.findMany();
    const todaySales = todayOrders.filter(
      (o) =>
        new Date(o.createdAt) >= today &&
        ["paid", "shipped", "delivered"].includes(o.status)
    );
    const todayRevenue = todaySales.reduce((a, o) => a + Number(o.total), 0);

    // ── 2. Órdenes pagadas en su totalidad sin boleta (ready to invoice) ────
    // A fully-paid order: status is paid/shipped/delivered AND amountPaid >= total
    const paidOrders = await db.query.orders.findMany({
      where: inArray(orders.status, ["paid", "shipped", "delivered"]),
    });

    const noBoleta = paidOrders.filter((o) => {
      const isPaid = Number(o.amountPaid) >= Number(o.total);
      return isPaid && !o.boletaUrl;
    });

    // ── 3. Pre-orders with pending balance ─────────────────────────────────
    const preOrdersWithSaldo = paidOrders.filter((o) => {
      return o.isPreOrder && Number(o.amountPaid) < Number(o.total);
    });

    // ── Build and send Telegram message ────────────────────────────────────
    let msg =
      `🌅 <b>RESUMEN DIARIO — ANTA</b>\n` +
      `${today.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}\n\n`;

    // Sales today
    if (todaySales.length > 0) {
      msg += `📊 <b>Ventas de hoy:</b> ${todaySales.length} órdenes · $${todayRevenue.toLocaleString("es-CL")}\n\n`;
    } else {
      msg += `📊 Sin ventas confirmadas hoy.\n\n`;
    }

    // Boleta reminders
    if (noBoleta.length > 0) {
      msg += `🧾 <b>Sin boleta (${noBoleta.length} órdenes pagadas):</b>\n`;
      for (const o of noBoleta.slice(0, 8)) {
        const shortId = o.id.split("-")[0];
        msg +=
          `  • <b>${o.customerName || o.guestEmail || "?"}</b> · <code>${shortId}</code> · $${Number(o.total).toLocaleString("es-CL")}\n` +
          `    Envía boleta: caption <code>/boleta ${shortId}</code>\n`;
      }
      if (noBoleta.length > 8) msg += `  <i>...y ${noBoleta.length - 8} más</i>\n`;
      msg += "\n";
    } else {
      msg += `✅ Todas las órdenes pagadas tienen boleta emitida.\n\n`;
    }

    // Pre-orders with pending saldo
    if (preOrdersWithSaldo.length > 0) {
      msg += `🔖 <b>Pre-orders con saldo pendiente (${preOrdersWithSaldo.length}):</b>\n`;
      for (const o of preOrdersWithSaldo.slice(0, 5)) {
        const shortId = o.id.split("-")[0];
        const saldo = Number(o.total) - Number(o.amountPaid);
        msg +=
          `  • <b>${o.customerName || o.guestEmail || "?"}</b> · <code>${shortId}</code>\n` +
          `    Saldo: <b>$${saldo.toLocaleString("es-CL")}</b> · Registrar: <code>/abono ${shortId} ${saldo}</code>\n`;
      }
      if (preOrdersWithSaldo.length > 5) msg += `  <i>...y ${preOrdersWithSaldo.length - 5} más</i>\n`;
    }

    await sendTelegramNotification(msg.trim());

    return NextResponse.json({
      success: true,
      todaySales: todaySales.length,
      pendingBoletas: noBoleta.length,
      preOrdersWithSaldo: preOrdersWithSaldo.length,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed", detail: String(error) }, { status: 500 });
  }
}
