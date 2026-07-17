"use server";

import { sendTelegramNotification } from "@/lib/telegram";

export async function sendContactMessage(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!name || !email || !message) {
    throw new Error("Todos los campos son obligatorios.");
  }
  if (message.length > 1000) {
    throw new Error("El mensaje es demasiado largo (máx. 1000 caracteres).");
  }

  // Notify Telegram group
  await sendTelegramNotification(
    `📩 <b>NUEVO MENSAJE DE CONTACTO</b>\n\n` +
    `👤 <b>Nombre:</b> ${name}\n` +
    `📧 <b>Email:</b> ${email}\n\n` +
    `💬 <b>Mensaje:</b>\n${message}`
  );

  return { success: true };
}
