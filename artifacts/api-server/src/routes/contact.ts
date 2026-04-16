import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { db, contactRequestsTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { notifyContactRequest } from "../lib/notifier";
import { isCaptchaConfigured, verifyCaptcha } from "../lib/captcha";

const router: IRouter = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Слишком много заявок. Попробуйте позже." },
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

  const { website, source, captchaToken, ...payload } = parsed.data;

  // Honeypot — silently accept but discard suspected bots.
  if (website && website.trim().length > 0) {
    logger.warn({ ip: req.ip }, "Contact honeypot triggered");
    res.json({ ok: true });
    return;
  }

  const ipAddress = (req.ip ?? "").slice(0, 64) || null;

  if (isCaptchaConfigured()) {
    const captcha = await verifyCaptcha(captchaToken, ipAddress);
    if (!captcha.ok) {
      logger.warn(
        { ip: req.ip, reason: captcha.reason },
        "Contact captcha verification failed",
      );
      res.status(400).json({
        error: "captcha_failed",
        message: "Не удалось пройти проверку. Обновите страницу и попробуйте ещё раз.",
      });
      return;
    }
  }

  try {
    const userAgent = req.get("user-agent") ?? null;

    const [row] = await db
      .insert(contactRequestsTable)
      .values({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        company: payload.company?.trim() || null,
        message: payload.message.trim(),
        source: source?.trim() || null,
        ipAddress,
        userAgent,
      })
      .returning();

    logger.info({ contactId: row.id }, "Contact request stored");

    void notifyContactRequest({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      message: row.message,
      source: row.source,
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
