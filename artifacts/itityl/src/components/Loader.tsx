import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { easeInOutExpo } from "@/lib/motion";

type Props = { onDone: () => void };

const DURATION_MS = 1500;

export function Loader({ onDone }: Props) {
  const [count, setCount] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - p, 2.4);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setHide(true), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!hide && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.05, ease: easeInOutExpo }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <div className="absolute top-6 left-6 md:top-10 md:left-10 text-xs uppercase tracking-[0.3em] text-white/60 font-bold flex items-center gap-3">
            <span className="w-6 h-px bg-amber-300" />
            АЙ-ТИТУЛ
          </div>
          <div className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center">
            <img
              src="/logo.svg"
              alt="АЙ-ТИТУЛ"
              className="h-5 md:h-6 w-auto opacity-80"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeInOutExpo }}
            className="text-[26vw] lg:text-[18vw] leading-none font-heading font-extrabold tracking-tighter text-white tabular-nums"
          >
            {String(count).padStart(3, "0")}
          </motion.div>

          <div className="absolute bottom-10 left-6 right-6 md:left-10 md:right-10 flex items-center gap-4 md:gap-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold whitespace-nowrap">
              Загрузка
            </div>
            <div className="flex-1 h-px bg-white/15 relative overflow-hidden">
              <div
                className="absolute inset-y-[-1px] left-0 bg-amber-300"
                style={{ width: `${count}%`, transition: "width 80ms linear" }}
              />
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold tabular-nums">
              {count}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
