import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [loc] = useLocation();
  const prev = useRef(loc);
  useEffect(() => {
    if (prev.current !== loc) {
      prev.current = loc;
      if (typeof window !== "undefined" && !window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    }
  }, [loc]);
  return null;
}
