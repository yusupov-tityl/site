import { useEffect, useRef } from "react";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0.2]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    const p = v.play();
    if (p) {
      p.catch(() => {
        const onClick = () => {
          v.play();
          document.removeEventListener("click", onClick);
        };
        document.addEventListener("click", onClick);
      });
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const el = ref.current;
    if (!el) return;
    const blob1 = el.querySelector<HTMLElement>("[data-blob='1']");
    const blob2 = el.querySelector<HTMLElement>("[data-blob='2']");
    let mx = 0, my = 0, cx = 0, cy = 0;
    // Only run the rAF loop when the hero is actually in view AND the tab
    // is visible. When the user scrolls past the hero or switches away the
    // blobs hold their last position — which is invisible anyway — and we
    // stop eating CPU.
    let onScreen = true;
    let visible = !document.hidden;
    let running = false;

    const move = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mx = (e.clientX / w - 0.5) * 2;
      my = (e.clientY / h - 0.5) * 2;
    };
    const tick = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      if (blob1) blob1.style.transform = `translate3d(${cx * 40}px, ${cy * 40}px, 0)`;
      if (blob2) blob2.style.transform = `translate3d(${cx * -60}px, ${cy * -50}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (onScreen && visible) start();
      else stop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(el);
    const onVis = () => {
      visible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("mousemove", move, { passive: true });
    sync();
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="absolute inset-0 -z-0 overflow-hidden pointer-events-none"
      style={{ y, scale, opacity }}
    >
      {/* Video background.
          `preload="metadata"` + poster frame lets first paint finish
          instantly without blocking on the 4MB clip; the video starts
          decoding on its own once enough data arrives. Visual identical. */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={`${import.meta.env.BASE_URL}hero-bg.jpg`}
        className="absolute inset-0 w-full h-full object-cover"
        src={`${import.meta.env.BASE_URL}hero-bg.mp4`}
      />
      {/* Darken overlay for text legibility */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/50 to-transparent" />

      {/* Subtle amber blobs layered over video */}
      <div
        data-blob="1"
        className="absolute -top-40 -left-40 w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,180,80,0.45), rgba(220,120,40,0.25) 40%, transparent 70%)",
        }}
      />
      <div
        data-blob="2"
        className="absolute -bottom-40 -right-32 w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 70% 70%, rgba(255,120,40,0.40), rgba(180,60,20,0.25) 40%, transparent 70%)",
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </motion.div>
  );
}
