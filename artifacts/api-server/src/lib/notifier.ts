import { logger } from "./logger";

export type ContactNotification = {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  message: string;
  source?: string | null;
  createdAt: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTelegramMessage(req: ContactNotification): string {
  const lines = [
    "<b>📩 Новая заявка с itityl.ru</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(req.name)}`,
    `<b>Email:</b> ${escapeHtml(req.email)}`,
  ];
  if (req.company) lines.push(`<b>Компания:</b> ${escapeHtml(req.company)}`);
  if (req.source) lines.push(`<b>Источник:</b> ${escapeHtml(req.source)}`);
  lines.push("", `<b>Сообщение:</b>\n${escapeHtml(req.message)}`);
  lines.push("", `<i>ID #${req.id} · ${req.createdAt.toISOString()}</i>`);
  return lines.join("\n");
}

export async function notifyContactRequest(
  req: ContactNotification,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.info(
      { contactId: req.id },
      "Telegram notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured",
    );
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatTelegramMessage(req),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      logger.error(
        { contactId: req.id, status: response.status, body },
        "Telegram notification failed",
      );
      return;
    }

    logger.info({ contactId: req.id }, "Telegram notification sent");
  } catch (err) {
    logger.error(
      { contactId: req.id, err },
      "Telegram notification error",
    );
  }
}
