import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0.2]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const el = ref.current;
    if (!el) return;
    const blob1 = el.querySelector<HTMLElement>("[data-blob='1']");
    const blob2 = el.querySelector<HTMLElement>("[data-blob='2']");
    let mx = 0, my = 0, cx = 0, cy = 0;
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
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
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
      <div
        data-blob="1"
        className="absolute -top-40 -left-40 w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-70"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,180,80,0.45), rgba(220,120,40,0.25) 40%, transparent 70%)",
        }}
      />
      <div
        data-blob="2"
        className="absolute -bottom-40 -right-32 w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-70"
        style={{
          background:
            "radial-gradient(circle at 70% 70%, rgba(255,120,40,0.40), rgba(180,60,20,0.25) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-[40vw] h-[40vw] -translate-x-1/2 rounded-full blur-[100px] opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(255,220,120,0.3), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </motion.div>
  );
}
