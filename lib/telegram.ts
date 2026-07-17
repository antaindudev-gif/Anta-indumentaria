const BOT_BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

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

  const body: any = { chat_id: chatId };

  if (imageUrl) {
    body.photo = imageUrl;
    body.caption = text;
    body.parse_mode = "HTML";
  } else {
    body.text = text;
    body.parse_mode = "HTML";
  }

  if (inlineKeyboard && inlineKeyboard.length > 0) {
    body.reply_markup = { inline_keyboard: inlineKeyboard };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("Error enviando mensaje a Telegram", await res.text());
  } catch (error) {
    console.error("Excepción en sendTelegramNotification", error);
  }
}

// ─── File download helper ─────────────────────────────────────────────────────

/**
 * Given a Telegram file_id, fetches the file path via getFile API
 * and downloads the binary content as a Buffer.
 * Returns { buffer, mimeType, filename }.
 */
export async function downloadTelegramFile(fileId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN no configurado");

  // Step 1: getFile — returns file_path
  const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  if (!getFileRes.ok) throw new Error(`getFile failed: ${getFileRes.status}`);
  const getFileData = await getFileRes.json();
  if (!getFileData.ok || !getFileData.result?.file_path) {
    throw new Error(`getFile: archivo no encontrado para file_id ${fileId}`);
  }

  const filePath: string = getFileData.result.file_path;
  const filename = filePath.split("/").pop() ?? "archivo";

  // Step 2: download the actual file
  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const downloadRes = await fetch(downloadUrl);
  if (!downloadRes.ok) throw new Error(`Descarga falló: ${downloadRes.status}`);

  const arrayBuffer = await downloadRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Determine MIME type from extension
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const mimeType = mimeMap[ext] ?? "application/octet-stream";

  return { buffer, mimeType, filename };
}
