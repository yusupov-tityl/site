import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { db, contactRequestsTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { notifyContactRequest, type RequestType } from "../lib/notifier";

const router: IRouter = Router();

// 5 req/h per IP is generous for legitimate use (a person rarely needs
// to submit more than 1–2 leads per hour) and tight enough that a bot
// flood gets capped at 5 attempts per IP before backoff. Honeypot
// catches the rest. No captcha — explicit decision per Task #8.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "rate_limited",
    message: "Слишком много заявок. Попробуйте позже.",
  },
});

router.post("/contact", contactLimiter, async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "Проверьте корректность заполнения полей.",
    });
    return;
  }

  const {
    website,
    name,
    company,
    position,
    email,
    phone,
    message,
    requestType,
    consent,
    source,
    pageUrl,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  } = parsed.data;

  // Honeypot — silently accept but discard suspected bots.
  if (website && website.trim().length > 0) {
    logger.warn({ ip: req.ip }, "Contact honeypot triggered");
    res.json({ ok: true });
    return;
  }

  // Server-side guards the spec layer can't express:
  //   • Consent must be true (152-ФЗ).
  //   • Phone OR email — at least one contact channel.
  if (!consent) {
    res.status(400).json({
      error: "consent_required",
      message: "Необходимо согласие на обработку персональных данных.",
    });
    return;
  }
  const hasEmail = Boolean(email && email.trim().length > 0);
  const hasPhone = Boolean(phone && phone.trim().length > 0);
  if (!hasEmail && !hasPhone) {
    res.status(400).json({
      error: "contact_required",
      message: "Укажите email или телефон — хотя бы одно поле.",
    });
    return;
  }

  const ipAddress = (req.ip ?? "").slice(0, 64) || null;

  try {
    const userAgent = req.get("user-agent") ?? null;

    const [row] = await db
      .insert(contactRequestsTable)
      .values({
        name: name.trim(),
        company: company.trim(),
        position: position?.trim() || null,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        requestType,
        source: source?.trim() || null,
        pageUrl: pageUrl?.trim() || null,
        referrer: referrer?.trim() || null,
        utmSource: utmSource?.trim() || null,
        utmMedium: utmMedium?.trim() || null,
        utmCampaign: utmCampaign?.trim() || null,
        utmContent: utmContent?.trim() || null,
        utmTerm: utmTerm?.trim() || null,
        ipAddress,
        userAgent,
      })
      .returning();

    logger.info({ contactId: row.id }, "Contact request stored");

    // Fire-and-forget — DB persistence already guarantees the lead won't
    // be lost. Notifier never throws; it logs per-channel failures and
    // returns a summary we don't await on the response path.
    void notifyContactRequest({
      id: row.id,
      name: row.name,
      company: row.company,
      position: row.position,
      email: row.email,
      phone: row.phone,
      message: row.message,
      requestType: row.requestType as RequestType,
      source: row.source,
      pageUrl: row.pageUrl,
      referrer: row.referrer,
      utm: {
        source: row.utmSource,
        medium: row.utmMedium,
        campaign: row.utmCampaign,
        content: row.utmContent,
        term: row.utmTerm,
      },
      createdAt: row.createdAt,
    });

    res.json({ ok: true, id: row.id });
  } catch (err) {
    logger.error({ err }, "Failed to store contact request");
    res.status(500).json({
      error: "internal_error",
      message: "Не удалось сохранить заявку. Попробуйте позже.",
    });
  }
});

export default router;
