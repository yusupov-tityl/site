import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

type CursorState = "default" | "link" | "view" | "drag";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 });

  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
      });
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const inter = t.closest("a, button, [data-cursor]");
      if (!inter) {
        setState("default");
        setLabel("");
        return;
      }
      const cursor = inter.getAttribute("data-cursor");
      const cursorLabel = inter.getAttribute("data-cursor-label") || "";
      if (cursor === "view") {
        setState("view");
        setLabel(cursorLabel || "View");
      } else if (cursor === "drag") {
        setState("drag");
        setLabel(cursorLabel || "Drag");
      } else {
        setState("link");
        setLabel(cursorLabel);
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(rafRef.current);
    };
  }, [x, y]);

  if (!enabled) return null;

  const isLink = state === "link";
  const isView = state === "view";
  const isDrag = state === "drag";
  const big = isView || isDrag;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          className="relative rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-black"
          style={{ backgroundColor: "#fbbf24" }}
          animate={{
            width: big ? 92 : isLink ? 48 : 12,
            height: big ? 92 : isLink ? 48 : 12,
            x: big ? -46 : isLink ? -24 : -6,
            y: big ? -46 : isLink ? -24 : -6,
            rotate: isDrag ? 45 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.4 }}
        >
          {big && label && <span className="px-2 text-center leading-tight">{label}</span>}
        </motion.div>
      </motion.div>
      {/* Thin outline ring that trails slightly — pure style layer */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9998] mix-blend-difference"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          className="rounded-full border"
          style={{ borderColor: "rgba(251, 191, 36, 0.6)" }}
          animate={{
            width: big ? 112 : isLink ? 72 : 32,
            height: big ? 112 : isLink ? 72 : 32,
            x: big ? -56 : isLink ? -36 : -16,
            y: big ? -56 : isLink ? -36 : -16,
            opacity: big ? 0.4 : isLink ? 0.55 : 0.35,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.6 }}
        />
      </motion.div>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          html, body { cursor: none; }
          a, button, [data-cursor] { cursor: none; }
        }
      `}</style>
    </>
  );
}
