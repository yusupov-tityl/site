/**
 * Telemetry bootstrap: Sentry (errors) + Yandex.Metrica (analytics).
 *
 * Both are activated by build-time env vars. With no env vars set the
 * site behaves exactly as before — no analytics network calls, no
 * Sentry beacons. This lets us deploy this module immediately and
 * flip the switches later by adding the env vars on the VPS.
 *
 *   VITE_SENTRY_DSN     — full DSN URL from sentry.io project settings
 *   VITE_YM_COUNTER_ID  — numeric counter id from metrika.yandex.ru
 *
 * On the VPS, append both to artifacts/itityl/.env.production before
 * the build step, or set them as GitHub Actions repo variables and
 * pass through to the build command.
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
// Yandex.Metrica counter ID is hardcoded in index.html as part of the
// official async snippet (it has to fire before main.tsx loads, so an
// env var doesn't help). We just mirror the same number here so SPA
// route-change page-views fire under the right counter.
const YM_ID = 108772201;

/**
 * Initialise Sentry. Dynamically imported so the SDK isn't shipped to
 * users when no DSN is configured.
 */
export async function initSentry(): Promise<void> {
  if (!SENTRY_DSN) return;
  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn: SENTRY_DSN,
      // Keep beacons quiet — we only want client errors, not perf
      // traces, until we know we need them.
      tracesSampleRate: 0,
      // Filter out a few known no-op browser errors that flood Sentry
      // for any public marketing site.
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications.",
        "Non-Error promise rejection captured",
        // Telegram WebView fires this when audio is blocked — handled.
        "The request is not allowed by the user agent",
      ],
      environment: import.meta.env.MODE,
    });
  } catch {
    // Loading Sentry failed (offline build, blocked CDN). Silent —
    // Sentry being missing should never break the site.
  }
}

/**
 * Yandex.Metrica is initialised by the async snippet in index.html
 * before main.tsx evaluates, so this function is intentionally a
 * no-op. Kept as an export so main.tsx can call it without a flag.
 */
export function initYandexMetrica(): void {
  /* injected via index.html */
}

/**
 * Track a virtual page view. Call from a route-change effect so SPA
 * navigations show up in Metrica's Pages report.
 */
export function trackPageView(path: string): void {
  if (!Number.isFinite(YM_ID) || YM_ID <= 0) return;
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  };
  try {
    w.ym?.(YM_ID, "hit", path);
  } catch {
    /* noop */
  }
}
