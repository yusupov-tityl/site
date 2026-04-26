import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/telemetry";

export function ScrollToTop() {
  const [loc] = useLocation();
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (prev.current !== loc) {
      const isFirst = prev.current === null;
      prev.current = loc;
      if (typeof window !== "undefined" && !window.location.hash && !isFirst) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      // Fire a Metrica virtual page view on every SPA navigation so
      // the Pages report doesn't show one giant "/" pile.
      trackPageView(loc);
    }
  }, [loc]);
  return null;
}
