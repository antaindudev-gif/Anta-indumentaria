import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.origin; // e.g., https://antaindumentaria.cl
  
  if (domain.includes("localhost")) {
    return NextResponse.json({ error: "No puedes registrar un Webhook en localhost. Sube la página a Vercel primero." }, { status: 400 });
  }

  const webhookUrl = `${domain}/api/telegram`;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ error: "Falta TELEGRAM_BOT_TOKEN" }, { status: 500 });
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
  const data = await response.json();

  return NextResponse.json({
    success: true,
    message: "Webhook de Telegram registrado correctamente. Ahora los botones funcionarán.",
    telegramResponse: data
  });
}
