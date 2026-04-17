import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { easeOutExpo, fadeUp } from "@/lib/motion";

type Service = {
  ru: string;
  en: string;
  gradient: string;
  video?: string;
  poster?: string;
};

const previewVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.3, ease: easeOutExpo } },
};

export function ServicesList({ services }: { services: Service[] }) {
  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [prefetched, setPrefetched] = useState(false);

  // When the section becomes visible, start warm-fetching all clips so
  // the first hover doesn't have to wait for the network.
  useEffect(() => {
    if (prefetched) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          services.forEach((s) => {
            if (!s.video) return;
            // Full fetch into HTTP cache (best effort, ignored if blocked).
            fetch(s.video, { mode: "no-cors", cache: "force-cache" }).catch(() => {});
          });
          setPrefetched(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [services, prefetched]);

  return (
    <div ref={rootRef} className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-black/15">
      <div className="lg:col-span-8 flex flex-col">
        {services.map((service, index) => {
          const isActive = active === index;
          return (
            <motion.a
              key={index}
              href="#contact"
              variants={fadeUp}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive((v) => (v === index ? null : v))}
              onFocus={() => setActive(index)}
              data-cursor="view"
              data-cursor-label="Связаться"
              className="group relative flex items-center justify-between py-8 md:py-10 border-b border-black/15 px-2 md:px-4 -mx-2 md:-mx-4 overflow-hidden"
            >
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-black origin-bottom"
                initial={false}
                animate={{ scaleY: isActive ? 1 : 0 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                style={{ transformOrigin: isActive ? "bottom" : "top" }}
              />
              <div className="relative flex items-baseline gap-4 md:gap-8">
                <span
                  className={`text-xs font-bold tracking-widest w-8 flex-shrink-0 transition-colors duration-500 ${
                    isActive ? "text-white/50" : "text-black/30"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <motion.h3
                  animate={{
                    x: isActive ? 16 : 0,
                    color: isActive ? "#ffffff" : "#000000",
                  }}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                  className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold uppercase tracking-tighter"
                >
                  {service.ru}
                </motion.h3>
              </div>
              <div className="relative flex items-center gap-4">
                <span
                  className={`text-xs uppercase tracking-widest hidden md:block transition-colors duration-500 ${
                    isActive ? "text-white/50" : "text-black/40"
                  }`}
                >
                  {service.en}
                </span>
                <motion.div
                  animate={{
                    rotate: isActive ? 0 : -45,
                    color: isActive ? "#ffffff" : "#000000",
                  }}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                >
                  <ArrowUpRight className="w-7 h-7 md:w-10 md:h-10" />
                </motion.div>
              </div>
            </motion.a>
          );
        })}
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-24 h-[420px] self-start ml-8 mt-0">
        <div className="relative w-full h-full overflow-hidden border border-black/15">
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div
                key={active}
                variants={previewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 overflow-hidden bg-black"
              >
                {/* Poster shown instantly while video decodes */}
                {services[active].poster && (
                  <img
                    src={services[active].poster}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Video layer — plays under the "01 Consulting & strategy" label */}
                {services[active].video && (
                  <video
                    key={services[active].video}
                    src={services[active].video}
                    poster={services[active].poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Existing gradient — now semi-transparent so video shows through */}
                <div
                  className="absolute inset-0 opacity-40 mix-blend-multiply"
                  style={{ background: services[active].gradient }}
                />
                {/* Noise texture kept, but lighter */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
                  }}
                />
                {/* Subtle dark gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
                {/* "01 Consulting & Strategy" label stays on top */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative text-center px-8">
                    <div className="text-[7rem] leading-none font-heading font-extrabold text-white/90 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                      {String(active + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-4 text-white text-xl font-heading font-extrabold uppercase tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                      {services[active].en}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {active === null && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/[0.03]"
              >
                <span className="text-xs uppercase tracking-[0.3em] text-black/40">
                  Наведите на услугу
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
