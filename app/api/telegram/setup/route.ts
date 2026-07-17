import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.origin;

  if (domain.includes("localhost")) {
    return NextResponse.json({ error: "No puedes registrar un Webhook en localhost. Sube la página a Vercel primero." }, { status: 400 });
  }

  const webhookUrl = `${domain}/api/telegram`;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!botToken) return NextResponse.json({ error: "Falta TELEGRAM_BOT_TOKEN" }, { status: 500 });
  if (!secret)  return NextResponse.json({ error: "Falta TELEGRAM_WEBHOOK_SECRET en las variables de entorno" }, { status: 500 });

  // Register the webhook with secret_token.
  // Telegram will send "X-Telegram-Bot-Api-Secret-Token: <secret>" on every update.
  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    }),
  });
  const data = await response.json();

  return NextResponse.json({
    success: true,
    message: "Webhook registrado con secret_token. Cada update llegará con el header X-Telegram-Bot-Api-Secret-Token.",
    telegramResponse: data,
  });
}
