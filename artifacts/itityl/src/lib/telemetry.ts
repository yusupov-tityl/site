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
const YM_ID_RAW = import.meta.env.VITE_YM_COUNTER_ID as string | undefined;
const YM_ID = YM_ID_RAW ? Number.parseInt(YM_ID_RAW, 10) : NaN;

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
 * Inject Yandex.Metrica counter. Uses the standard async snippet from
 * metrika.yandex.ru/admin so the network request never blocks first
 * paint. Includes click-map, accurate-bounce-rate and webvisor —
 * standard B2B tracking baseline.
 */
export function initYandexMetrica(): void {
  if (!Number.isFinite(YM_ID) || YM_ID <= 0) return;
  if (typeof window === "undefined") return;

  // Snippet adapted from metrika.yandex.ru/code/. We avoid the
  // document.write form (deprecated in modern Chrome) — use a plain
  // <script> append instead.
  type Ym = ((id: number, method: string, ...args: unknown[]) => void) & {
    a?: unknown[];
    l?: number;
  };
  const w = window as unknown as { ym?: Ym; Ya?: unknown };
  if (!w.ym) {
    const ym: Ym = function (...args: unknown[]) {
      (ym.a = ym.a || []).push(args);
    } as Ym;
    ym.l = Date.now();
    w.ym = ym;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);

  w.ym!(YM_ID, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });

  // <noscript> pixel for users with JS disabled / scrapers — gives
  // Metrica a chance to register the visit anyway.
  const ns = document.createElement("noscript");
  const img = document.createElement("img");
  img.src = `https://mc.yandex.ru/watch/${YM_ID}`;
  img.style.cssText = "position:absolute;left:-9999px;";
  img.alt = "";
  ns.appendChild(img);
  document.body.appendChild(ns);
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
