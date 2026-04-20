const TELEGRAM_API_BASE = "https://api.telegram.org";
const TELEGRAM_REQUEST_TIMEOUT_MS = 2500;

function escapeTelegramHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

type TelegramField = {
  label: string;
  value: string;
};

type TelegramMessageInput = {
  context: string;
  title: string;
  fields: TelegramField[];
};

type TelegramSendResult = { ok: true } | { ok: false; skipped?: boolean; reason: string };

function buildTelegramHtmlMessage(title: string, fields: TelegramField[]) {
  const lines = fields.map(
    ({ label, value }) => `<b>${escapeTelegramHtml(label)}:</b> ${escapeTelegramHtml(value)}`,
  );
  return [`<b>${escapeTelegramHtml(title)}</b>`, "", ...lines].join("\n");
}

export async function sendTelegramHtmlMessage({
  context,
  title,
  fields,
}: TelegramMessageInput): Promise<TelegramSendResult> {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!telegramBotToken || !telegramChatId) {
    console.warn(`[Telegram:${context}] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured`);
    return { ok: false, skipped: true, reason: "missing_telegram_config" };
  }

  const text = buildTelegramHtmlMessage(title, fields);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TELEGRAM_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: telegramChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[Telegram:${context}] API error ${response.status}: ${responseText}`);
      return { ok: false, reason: `telegram_api_error_${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error(
        `[Telegram:${context}] Request timed out after ${TELEGRAM_REQUEST_TIMEOUT_MS}ms`,
      );
      return { ok: false, reason: "telegram_request_timeout" };
    }

    console.error(`[Telegram:${context}] Request failed`, error);
    return { ok: false, reason: "telegram_request_failed" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export { escapeTelegramHtml };
export type { TelegramField, TelegramMessageInput, TelegramSendResult };
