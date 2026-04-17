import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

type MagneticProps = {
  children: ReactNode;
  strength?: number;
} & Omit<HTMLMotionProps<"div">, "ref" | "style" | "children">;

export function Magnetic({
  children,
  strength = 0.35,
  className,
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });
  const rafRef = useRef(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  // rAF-throttled mouse-move handler — if the user waggles the mouse at
  // >60 Hz (gaming mice, trackpads) we coalesce the writes so the spring
  // gets exactly one update per frame.
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    pendingRef.current = {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    };
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const p = pendingRef.current;
      if (!p) return;
      x.set(p.x);
      y.set(p.y);
    });
  };
  const reset = () => {
    pendingRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: "inline-flex" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
