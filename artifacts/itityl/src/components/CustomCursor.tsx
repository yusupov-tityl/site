import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

type CursorState = "default" | "link" | "view" | "drag";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 35, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 35, mass: 0.5 });

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
          className="rounded-full bg-white flex items-center justify-center text-black text-[10px] font-bold uppercase tracking-widest"
          animate={{
            width: big ? 96 : isLink ? 56 : 14,
            height: big ? 96 : isLink ? 56 : 14,
            x: big ? -48 : isLink ? -28 : -7,
            y: big ? -48 : isLink ? -28 : -7,
            rotate: isDrag ? 45 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {big && label && <span>{label}</span>}
        </motion.div>
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
