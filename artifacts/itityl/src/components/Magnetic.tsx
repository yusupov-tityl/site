import { useRef, type ReactNode, type MouseEvent } from "react";
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

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

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
