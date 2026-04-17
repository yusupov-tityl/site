import { useEffect, useRef, useState } from "react";
import { m as motion, useMotionValue, useSpring } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

type CursorState = "default" | "link" | "view" | "drag";
type Theme = "dark" | "light";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 });

  const [state, setState] = useState<CursorState>("default");
  const [theme, setTheme] = useState<Theme>("dark");
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;
    setEnabled(true);

    const resolveTheme = (t: HTMLElement | null): Theme => {
      const light = t?.closest('[data-cursor-theme="light"]');
      return light ? "light" : "dark";
    };

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
      });
    };

    // Keep local copies of the current cursor state so we can skip calls
    // to setState whenever the mouse moves across elements that don't
    // change the computed state. This avoids a full React re-render of
    // the cursor tree (two <motion.div> springs) on every hovered node.
    let curState: CursorState = "default";
    let curLabel = "";
    let curTheme: Theme = "dark";
    const applyState = (next: CursorState, nextLabel: string, nextTheme: Theme) => {
      if (next !== curState) {
        curState = next;
        setState(next);
      }
      if (nextLabel !== curLabel) {
        curLabel = nextLabel;
        setLabel(nextLabel);
      }
      if (nextTheme !== curTheme) {
        curTheme = nextTheme;
        setTheme(nextTheme);
      }
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const nextTheme = resolveTheme(t);

      const inter = t.closest("a, button, [data-cursor]");
      if (!inter) {
        applyState("default", "", nextTheme);
        return;
      }
      const cursor = inter.getAttribute("data-cursor");
      const cursorLabel = inter.getAttribute("data-cursor-label") || "";
      if (cursor === "view") {
        applyState("view", cursorLabel || "View", nextTheme);
      } else if (cursor === "drag") {
        applyState("drag", cursorLabel || "Drag", nextTheme);
      } else {
        applyState("link", cursorLabel, nextTheme);
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
  const light = theme === "light";

  // Silver palette for light surfaces (no blend → predictable, never flips to blue).
  // Amber with mix-blend-difference for dark surfaces (classic inversion effect).
  const dotBg = light ? "#b8bcc4" : "#fbbf24";
  const ringBorder = light ? "rgba(120, 125, 135, 0.55)" : "rgba(251, 191, 36, 0.6)";
  const textColor = light ? "text-white" : "text-black";
  const blendClass = light ? "" : "mix-blend-difference";
  const dotShadow = light ? "0 6px 16px -4px rgba(90, 95, 110, 0.45)" : undefined;

  return (
    <>
      <motion.div
        aria-hidden
        className={`pointer-events-none fixed top-0 left-0 z-[9999] ${blendClass}`}
        style={{ x: sx, y: sy }}
      >
        <motion.div
          className={`relative rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] ${textColor}`}
          style={{ backgroundColor: dotBg, boxShadow: dotShadow }}
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
        className={`pointer-events-none fixed top-0 left-0 z-[9998] ${blendClass}`}
        style={{ x: sx, y: sy }}
      >
        <motion.div
          className="rounded-full border"
          style={{ borderColor: ringBorder }}
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
