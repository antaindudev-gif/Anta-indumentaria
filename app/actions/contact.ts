"use server";

import { sendTelegramNotification } from "@/lib/telegram";

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const telegramMessage = `✉️ <b>NUEVO MENSAJE DE CONTACTO</b> ✉️\n\n<b>Nombre:</b> ${name}\n<b>Email:</b> ${email}\n<b>Teléfono:</b> ${phone || 'N/A'}\n<b>Asunto:</b> ${subject}\n\n<b>Mensaje:</b>\n<i>${message}</i>`;

    await sendTelegramNotification(telegramMessage);

    return { success: true };
  } catch (error) {
    console.error("Contact Form Error:", error);
    return { success: false, error: "Error enviando el mensaje" };
  }
}
