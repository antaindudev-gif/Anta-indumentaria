import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Nota: El envío de correos vía Resend
import { sendEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Procesar interacciones de botones (Callback Queries)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data; // Ej: "approve_order_123"
      const chatId = callbackQuery.message.chat.id;
      const token = process.env.TELEGRAM_BOT_TOKEN;

      // Seguridad: Solo permitimos comandos desde nuestro Grupo de Administración
      if (chatId.toString() !== process.env.TELEGRAM_CHAT_ID) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // APROBAR ORDEN
      if (data.startsWith("approve_order_")) {
        const orderId = data.replace("approve_order_", "");
        
        // 1. Obtener la orden de la BD para sacar el email
        const orderRecord = await db.query.orders.findFirst({
          where: eq(orders.id, orderId)
        });

        if (!orderRecord) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // 2. Actualizar DB
        await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));

        // 3. Eliminar los botones del mensaje original
        await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: callbackQuery.message.message_id,
            reply_markup: { inline_keyboard: [] }
          })
        });

        // 4. Notificar en el chat quién lo aprobó
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ Orden <code>${orderId}</code> aprobada por ${callbackQuery.from.first_name || 'Admin'}. Correo de confirmación enviado.`,
            parse_mode: "HTML"
          })
        });

        // 5. Enviar Email al Cliente (Resend)
        if (orderRecord.guestEmail) {
          await sendEmail({
            to: orderRecord.guestEmail,
            subject: "¡Pago Aprobado! - Anta Indumentaria",
            html: `<h2>¡Hola ${orderRecord.shippingAddress?.name || 'Cliente'}!</h2>
                   <p>Tu comprobante ha sido revisado y <b>aprobado exitosamente</b>.</p>
                   <p>Estamos procesando tu orden #${orderId}. Te notificaremos apenas tu pedido sea despachado.</p>
                   <p>Gracias por preferir Anta Indumentaria.</p>`,
          });
        }
        
        return NextResponse.json({ success: true });
      }

      // RECHAZAR ORDEN
      if (data.startsWith("reject_order_")) {
        const orderId = data.replace("reject_order_", "");

        const orderRecord = await db.query.orders.findFirst({
          where: eq(orders.id, orderId)
        });

        if (!orderRecord) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        
        await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));

        await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: callbackQuery.message.message_id,
            reply_markup: { inline_keyboard: [] }
          })
        });

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `❌ Orden <code>${orderId}</code> rechazada por ${callbackQuery.from.first_name || 'Admin'}. Se ha notificado al cliente.`,
            parse_mode: "HTML"
          })
        });

        // 5. Enviar Email de rechazo al Cliente (Resend)
        if (orderRecord.guestEmail) {
          await sendEmail({
            to: orderRecord.guestEmail,
            subject: "Problemas con tu Pago - Anta Indumentaria",
            html: `<h2>Hola ${orderRecord.shippingAddress?.name || 'Cliente'}</h2>
                   <p>Hemos revisado tu comprobante para la orden #${orderId} pero lamentablemente <b>no pudimos verificar el pago</b>.</p>
                   <p>Tu orden ha sido pausada temporalmente. Si crees que esto es un error o tienes dudas, por favor contáctanos directamente respondiendo este correo.</p>`,
          });
        }
        
        return NextResponse.json({ success: true });
      }
    }

    // Procesar Comandos de Texto (Ej: /ventas)
    if (body.message && body.message.text) {
      const text = body.message.text;
      const chatId = body.message.chat.id;

      if (chatId.toString() !== process.env.TELEGRAM_CHAT_ID) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (text === "/ventas") {
        const todaysOrders = await db.query.orders.findMany({
          where: eq(orders.status, 'paid')
        });
        
        // Calcular suma
        const total = todaysOrders.reduce((acc, order) => acc + Number(order.total), 0);

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📊 <b>REPORTE DE VENTAS</b> 📊\n\nTienes <b>${todaysOrders.length}</b> ventas aprobadas registradas.\n\n<b>Ingreso Total:</b> $${total.toLocaleString("es-CL")}`,
            parse_mode: "HTML"
          })
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in Telegram Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
