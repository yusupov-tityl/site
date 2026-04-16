import { logger } from "./logger";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5_000;

export type CaptchaResult =
  | { ok: true; mode: "verified" | "skipped_unconfigured" }
  | { ok: false; reason: "missing_token" | "rejected" | "verify_error" };

export function isCaptchaConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verifies a Turnstile token. Fail-closed when the secret is configured.
 *
 * Behavior:
 * - No secret configured → skipped (form falls back to honeypot + rate-limit).
 * - Secret configured + token missing → rejected (missing_token).
 * - Secret configured + Cloudflare verify failure (network, non-2xx, timeout)
 *   → rejected (verify_error). Treated as untrusted.
 * - Secret configured + Cloudflare says success → verified.
 * - Secret configured + Cloudflare says failure → rejected.
 */
export async function verifyCaptcha(
  token: string | undefined,
  remoteIp: string | null,
): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true, mode: "skipped_unconfigured" };
  }

  if (!token || token.trim().length === 0) {
    return { ok: false, reason: "missing_token" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);
    if (remoteIp) body.append("remoteip", remoteIp);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error(
        { status: response.status },
        "Turnstile verify request returned non-2xx",
      );
      return { ok: false, reason: "verify_error" };
    }

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      logger.warn(
        { errorCodes: data["error-codes"] },
        "Turnstile verification rejected",
      );
      return { ok: false, reason: "rejected" };
    }

    return { ok: true, mode: "verified" };
  } catch (err) {
    logger.error({ err }, "Turnstile verification network error");
    return { ok: false, reason: "verify_error" };
  } finally {
    clearTimeout(timeout);
  }
}
