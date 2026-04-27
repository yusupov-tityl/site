import { useEffect } from "react";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/motion";

export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Lenis on touch devices fights the platform scroll engine and ends
    // up adding latency / jank, especially on mid-range Android. Native
    // momentum scroll on iOS / Android is already excellent; only run
    // Lenis where mouse-wheel smoothing is the actual win.
    if (typeof window !== "undefined") {
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const noHover = !window.matchMedia("(hover: hover)").matches;
      if (isCoarse || noHover) return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Disable touch interception explicitly — even though we bail above,
      // belt + suspenders: never touch the touch event stream.
      touchMultiplier: 0,
      syncTouch: false,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const handleAnchor = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -40 });
    };

    document.addEventListener("click", handleAnchor);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.removeEventListener("click", handleAnchor);
    };
  }, []);

  return null;
}
