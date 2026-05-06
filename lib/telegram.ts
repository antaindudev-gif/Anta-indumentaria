export async function sendTelegramNotification(text: string, imageUrl?: string, inlineKeyboard?: any[]) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Faltan variables de entorno para Telegram (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID)");
    return;
  }

  const endpoint = imageUrl 
    ? `https://api.telegram.org/bot${token}/sendPhoto`
    : `https://api.telegram.org/bot${token}/sendMessage`;

  const body: any = {
    chat_id: chatId,
  };

  if (imageUrl) {
    body.photo = imageUrl;
    body.caption = text;
    body.parse_mode = "HTML";
  } else {
    body.text = text;
    body.parse_mode = "HTML";
  }

  if (inlineKeyboard && inlineKeyboard.length > 0) {
    body.reply_markup = {
      inline_keyboard: inlineKeyboard,
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      console.error("Error enviando mensaje a Telegram", await res.text());
    }
  } catch (error) {
    console.error("Excepción en sendTelegramNotification", error);
  }
}
