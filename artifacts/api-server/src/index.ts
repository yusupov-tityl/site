import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
  logger.info("Telegram lead notifications enabled");
} else {
  logger.warn(
    "TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set; leads will only be stored in DB and emailed",
  );
}
if (process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_TO) {
  logger.info(
    { to: process.env.LEAD_EMAIL_TO },
    "Email lead notifications enabled (Resend)",
  );
} else {
  logger.warn(
    "RESEND_API_KEY / LEAD_EMAIL_TO not set; email channel is disabled",
  );
}
if (process.env.TELEGRAM_RELAY_URL) {
  logger.info(
    { url: process.env.TELEGRAM_RELAY_URL },
    "Telegram via relay (proxy)",
  );
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
