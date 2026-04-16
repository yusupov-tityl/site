import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
          size?: "normal" | "flexible" | "compact" | "invisible";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile_load_error")));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile_load_error"));
    document.head.appendChild(script);
  });
}

export type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  className?: string;
};

export function TurnstileWidget({
  siteKey,
  onToken,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          size: "flexible",
          theme: "light",
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => onTokenRef.current(null),
          "expired-callback": () => onTokenRef.current(null),
          "timeout-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => {
        // If widget fails to load, allow submission to proceed; server will
        // either also be without secret (fallback) or reject the request.
        onTokenRef.current(null);
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className={className}>
      <div ref={containerRef} data-testid="turnstile-widget" />
    </div>
  );
}
