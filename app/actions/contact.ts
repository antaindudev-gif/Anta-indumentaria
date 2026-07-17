"use server";

import { sendTelegramNotification } from "@/lib/telegram";

// Basic email regex — blocks obvious non-emails without importing a full library
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactMessage(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!name || !email || !message) throw new Error("Todos los campos son obligatorios.");
  if (name.length > 100) throw new Error("El nombre es demasiado largo.");
  if (!EMAIL_RE.test(email)) throw new Error("El email no tiene un formato válido.");
  if (message.length > 1000) throw new Error("El mensaje es demasiado largo (máx. 1000 caracteres).");

  // Sanitize: strip HTML tags before sending to Telegram to prevent injection
  const safeName = name.replace(/[<>&"]/g, "");
  const safeEmail = email.replace(/[<>&"]/g, "");
  const safeMessage = message.replace(/[<>&"]/g, "");

  await sendTelegramNotification(
    `📩 <b>NUEVO MENSAJE DE CONTACTO</b>\n\n` +
    `👤 <b>Nombre:</b> ${safeName}\n` +
    `📧 <b>Email:</b> ${safeEmail}\n\n` +
    `💬 <b>Mensaje:</b>\n${safeMessage}`
  );

  return { success: true };
}
