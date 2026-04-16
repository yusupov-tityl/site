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

if (process.env.TURNSTILE_SECRET_KEY) {
  logger.info("Cloudflare Turnstile verification enabled for /contact");
} else {
  logger.warn(
    "TURNSTILE_SECRET_KEY not set; /contact relies on honeypot + rate-limit only",
  );
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
