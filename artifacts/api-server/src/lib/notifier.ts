/**
 * Lead notifications: Telegram (primary) + email (dual-channel fallback).
 *
 * Both channels are env-gated and fire INDEPENDENTLY in parallel — neither
 * one waits for the other and neither one failing affects the user-facing
 * response. The lead is already persisted in Postgres before we get here,
 * so worst case the team reads it out of the `contact_requests` table.
 *
 * Why two channels?
 *   – Telegram is fast and where the sales team lives day-to-day.
 *   – Email gives us an audit trail in pochta@i-tityl.ru and survives
 *     Telegram-bot deletion / token rotation / @BotFather quirks. For B2G
 *     deals this is the official record.
 *
 * Anything more complex (retry queues, webhooks, CRM push) lives outside
 * this module and reads from the DB.
 */
import { Agent, fetch as undiciFetch } from "undici";
import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger";

// Force IPv4 for outbound calls. On Russian VPS hosts:
//   – IPv6 routing to Yandex SMTP often isn't configured (ENETUNREACH).
//   – Even where IPv6 works, happy-eyeballs racing can pick a dead path.
// IPv4 endpoints are reachable; IPv6 sometimes isn't. We force the
// address family on both channels.
//
// IMPORTANT: we MUST use `fetch` from the `undici` package together
// with `Agent` from the same package. Node 22's built-in `fetch` uses
// an INTERNAL bundled undici and rejects userland Agents with
// "invalid onRequestStart method". Always pair the two.
const IPV4_AGENT = new Agent({
  connect: { family: 4, timeout: 8000 },
  bodyTimeout: 8000,
  headersTimeout: 8000,
});

export type RequestType = "diagnostics" | "pilot" | "consultation" | "other";

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  diagnostics: "Диагностика процессов",
  pilot: "Пилот ИИ-решения",
  consultation: "Консультация",
  other: "Другое",
};

export type ContactNotification = {
  id: number;
  name: string;
  company: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  requestType: RequestType;
  source?: string | null;
  pageUrl?: string | null;
  referrer?: string | null;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  };
  createdAt: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatMoscowTime(d: Date): string {
  try {
    // Moscow is UTC+3 year-round (no DST), so a fixed offset is correct.
    const parts = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Moscow",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get(
      "minute",
    )} МСК`;
  } catch {
    return d.toISOString();
  }
}

function hasAnyUtm(utm: ContactNotification["utm"]): boolean {
  if (!utm) return false;
  return Boolean(
    utm.source || utm.medium || utm.campaign || utm.content || utm.term,
  );
}

function formatUtm(utm: NonNullable<ContactNotification["utm"]>): string {
  const parts: string[] = [];
  if (utm.source) parts.push(`source=${utm.source}`);
  if (utm.medium) parts.push(`medium=${utm.medium}`);
  if (utm.campaign) parts.push(`campaign=${utm.campaign}`);
  if (utm.content) parts.push(`content=${utm.content}`);
  if (utm.term) parts.push(`term=${utm.term}`);
  return parts.join(" · ");
}

function formatTelegramMessage(req: ContactNotification): string {
  const lines: string[] = [];
  lines.push("🔔 <b>Новая заявка с itityl.ru</b>");
  lines.push("");
  lines.push(`👤 <b>Имя:</b> ${escapeHtml(req.name)}`);
  lines.push(`🏢 <b>Организация:</b> ${escapeHtml(req.company)}`);
  if (req.position) {
    lines.push(`💼 <b>Должность:</b> ${escapeHtml(req.position)}`);
  }
  if (req.phone) lines.push(`📞 <b>Телефон:</b> ${escapeHtml(req.phone)}`);
  if (req.email) lines.push(`✉️ <b>Email:</b> ${escapeHtml(req.email)}`);
  lines.push(
    `🧩 <b>Тип запроса:</b> ${escapeHtml(REQUEST_TYPE_LABEL[req.requestType])}`,
  );
  if (req.message) {
    lines.push("");
    lines.push("📝 <b>Задача:</b>");
    lines.push(escapeHtml(req.message));
  }
  lines.push("");
  lines.push("———");
  if (req.pageUrl) lines.push(`🔗 <b>Страница:</b> ${escapeHtml(req.pageUrl)}`);
  if (req.source) lines.push(`🎯 <b>CTA:</b> ${escapeHtml(req.source)}`);
  if (req.referrer) lines.push(`↪️ <b>Referrer:</b> ${escapeHtml(req.referrer)}`);
  if (hasAnyUtm(req.utm) && req.utm) {
    lines.push(`📊 <b>UTM:</b> ${escapeHtml(formatUtm(req.utm))}`);
  }
  lines.push(`🕒 ${escapeHtml(formatMoscowTime(req.createdAt))}`);
  lines.push(`<i>ID #${req.id}</i>`);
  return lines.join("\n");
}

function formatEmailBody(req: ContactNotification): {
  text: string;
  html: string;
} {
  const lines: string[] = [];
  lines.push("Новая заявка с itityl.ru");
  lines.push("");
  lines.push(`Имя: ${req.name}`);
  lines.push(`Организация: ${req.company}`);
  if (req.position) lines.push(`Должность: ${req.position}`);
  if (req.phone) lines.push(`Телефон: ${req.phone}`);
  if (req.email) lines.push(`Email: ${req.email}`);
  lines.push(`Тип запроса: ${REQUEST_TYPE_LABEL[req.requestType]}`);
  if (req.message) {
    lines.push("");
    lines.push("Задача:");
    lines.push(req.message);
  }
  lines.push("");
  lines.push("---");
  if (req.pageUrl) lines.push(`Страница: ${req.pageUrl}`);
  if (req.source) lines.push(`CTA: ${req.source}`);
  if (req.referrer) lines.push(`Referrer: ${req.referrer}`);
  if (hasAnyUtm(req.utm) && req.utm) lines.push(`UTM: ${formatUtm(req.utm)}`);
  lines.push(`Время: ${formatMoscowTime(req.createdAt)}`);
  lines.push(`ID #${req.id}`);

  const text = lines.join("\n");

  // HTML version mirrors the text but escapes everything and wraps with
  // light formatting. Keep it plain — no inline CSS that mail clients
  // will mangle.
  const htmlLines = lines.map((line) => {
    if (!line) return "<br/>";
    if (line === "---") return "<hr/>";
    if (line === "Новая заявка с itityl.ru") {
      return `<h2 style="margin:0 0 12px;">${escapeHtml(line)}</h2>`;
    }
    if (line === "Задача:") {
      return `<p style="margin:12px 0 4px;font-weight:bold;">${escapeHtml(line)}</p>`;
    }
    const colon = line.indexOf(":");
    if (colon > 0 && colon < 30) {
      const label = line.slice(0, colon);
      const value = line.slice(colon + 1).trim();
      return `<p style="margin:2px 0;"><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</p>`;
    }
    return `<p style="margin:2px 0;">${escapeHtml(line)}</p>`;
  });
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">${htmlLines.join("")}</div>`;

  return { text, html };
}

// ── Telegram channel ──────────────────────────────────────────────────

async function sendTelegram(req: ContactNotification): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    logger.info(
      { contactId: req.id },
      "Telegram skipped: TELEGRAM_BOT_TOKEN/CHAT_ID not configured",
    );
    return false;
  }
  try {
    // Use undici.fetch (NOT global fetch) so the IPV4_AGENT dispatcher
    // is honored — see IPV4_AGENT comment.
    const response = await undiciFetch(
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
        dispatcher: IPV4_AGENT,
      },
    );
    if (!response.ok) {
      const body = await response.text();
      logger.error(
        { contactId: req.id, status: response.status, body },
        "Telegram notification failed",
      );
      return false;
    }
    logger.info({ contactId: req.id }, "Telegram notification sent");
    return true;
  } catch (err) {
    logger.error({ contactId: req.id, err }, "Telegram notification error");
    return false;
  }
}

// ── Email channel (nodemailer) ────────────────────────────────────────

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !portStr || !user || !pass) return null;
  const port = Number.parseInt(portStr, 10);
  if (!Number.isFinite(port)) return null;
  // SMTP_SECURE=true forces TLS on connect (port 465); false uses
  // STARTTLS upgrade (port 587). Default by port number when unset.
  const explicitSecure = process.env.SMTP_SECURE;
  const secure =
    explicitSecure === "true"
      ? true
      : explicitSecure === "false"
        ? false
        : port === 465;
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // Force IPv4 lookup; Russian VPS often lacks IPv6 routing.
    // Tight timeouts so a dead route fails fast (default is 2 minutes,
    // which produces a 2-min hang per lead before logging).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return cachedTransporter;
}

async function sendEmail(req: ContactNotification): Promise<boolean> {
  const transporter = getTransporter();
  const to = process.env.LEAD_EMAIL_TO;
  if (!transporter || !to) {
    logger.info(
      { contactId: req.id },
      "Email skipped: SMTP_* / LEAD_EMAIL_TO not configured",
    );
    return false;
  }
  const from =
    process.env.LEAD_EMAIL_FROM ?? process.env.SMTP_USER ?? "noreply@itityl.ru";
  const { text, html } = formatEmailBody(req);
  const replyTo = req.email ?? undefined;
  const subject = `Заявка #${req.id} — ${req.company} (${REQUEST_TYPE_LABEL[req.requestType]})`;
  try {
    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      text,
      html,
    });
    logger.info({ contactId: req.id }, "Email notification sent");
    return true;
  } catch (err) {
    logger.error({ contactId: req.id, err }, "Email notification error");
    return false;
  }
}

// ── Public entrypoint ─────────────────────────────────────────────────

/**
 * Fan out the lead to both Telegram and email IN PARALLEL. Never throws —
 * the lead is already in the DB, so the response to the user is already
 * safe by the time this runs. Errors are logged per-channel.
 *
 * Returns a tiny summary so callers can log delivery status, but most
 * callers should just `void` this.
 */
export async function notifyContactRequest(
  req: ContactNotification,
): Promise<{ telegram: boolean; email: boolean }> {
  const [telegram, email] = await Promise.all([
    sendTelegram(req).catch(() => false),
    sendEmail(req).catch(() => false),
  ]);
  return { telegram, email };
}
