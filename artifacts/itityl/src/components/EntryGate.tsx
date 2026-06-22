import { useEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { easeInOutExpo, easeOutExpo } from "@/lib/motion";
import { unlockAudio, declineAudio } from "@/lib/audio-bootstrap";

type Props = { onEnter: () => void };

export function EntryGate({ onEnter }: Props) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Animate the loading counter 0 → 100 over ~1.6s.
  useEffect(() => {
    const start = performance.now();
    const DURATION = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 2.4);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setReady(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Subtle mouse-follow spotlight while the gate is shown.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let mx = 50, my = 50;
    let cx = 50, cy = 50;
    let raf = 0;
    const move = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 100;
      my = (e.clientY / window.innerHeight) * 100;
    };
    const tick = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      el.style.setProperty("--mx", `${cx}%`);
      el.style.setProperty("--my", `${cy}%`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleEnter = (withMusic: boolean) => (e?: React.SyntheticEvent) => {
    if (leaving) return;
    // CRITICAL: decide audio state FIRST, synchronously, while we're still
    // inside the user-gesture task. We can't rely on the document-level
    // click listener in audio-bootstrap because the preventDefault() below
    // cancels the synthetic click on mobile after touchend, and several
    // WebViews (Telegram, in-app Yandex/VK) don't count touchend itself
    // as a gesture activation for media-element play().
    if (withMusic) {
      unlockAudio();
    } else {
      // User explicitly opted out — tear down the gesture-unlock listener
      // so a later click on the page doesn't auto-start music. They can
      // still enable it via the BgMusic pill afterwards.
      declineAudio();
    }
    if (e?.preventDefault) {
      // On iOS, preventing the default click after a touchend avoids the
      // duplicate "ghost click" 300ms later that can re-trigger handlers.
      e.preventDefault();
    }
    setLeaving(true);
    try {
      document.dispatchEvent(
        new CustomEvent("itityl:enter", { detail: { withMusic } }),
      );
    } catch {
      /* noop */
    }
  };

  const handleEnterWithMusic = handleEnter(true);
  const handleEnterMuted = handleEnter(false);

  return (
    <AnimatePresence onExitComplete={onEnter}>
      {!leaving && (
        <motion.div
          key="gate"
          ref={ref}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: easeInOutExpo }}
          className="fixed inset-0 z-[200] overflow-hidden bg-black flex flex-col items-center justify-center"
          style={{
            // Used by the spotlight layer
            // @ts-expect-error - custom CSS vars typing
            "--mx": "50%",
            "--my": "50%",
          }}
          aria-label="Вход на сайт"
        >
          {/* Soft amber mouse-follow spotlight */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(600px circle at var(--mx) var(--my), rgba(255,180,80,0.18), transparent 60%)",
            }}
          />

          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          {/* Grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Top-left brand tag */}
          <div className="absolute top-6 left-6 md:top-10 md:left-10 text-xs uppercase tracking-[0.3em] text-white/60 font-bold flex items-center gap-3 z-10">
            <span className="w-6 h-px bg-amber-300" />
            АЙ-ТИТУЛ
          </div>

          {/* Top-right tagline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: easeOutExpo }}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-xs uppercase tracking-[0.3em] text-white/40 text-right z-10"
          >
            Прикладной ИИ<br />для корпоративной среды
          </motion.div>

          {/* Big animated numeral — becomes the visual focal point */}
          <motion.div
            key="count"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: ready ? 0.12 : 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeInOutExpo }}
            className="absolute text-[30vw] lg:text-[22vw] leading-none font-heading font-extrabold tracking-tighter text-white tabular-nums pointer-events-none select-none"
          >
            {String(count).padStart(3, "0")}
          </motion.div>

          {/* CTA buttons — appear when load finishes. The big disc is the
              primary "with music" path. A smaller link beneath it offers
              a muted entry so users on calls / in shared spaces aren't
              ambushed by audio. Both reuse the same exit animation. */}
          <AnimatePresence>
            {ready && (
              <motion.button
                key="enter-btn"
                type="button"
                onClick={handleEnterWithMusic}
                onTouchEnd={handleEnterWithMusic}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: easeOutExpo }}
                className="group relative z-10 flex items-center justify-center"
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                aria-label="Войти на сайт с фоновой музыкой"
                data-cursor="view"
                data-cursor-label="Войти"
              >
                {/* Outer rotating conic ring */}
                <motion.span
                  aria-hidden
                  className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(255,180,80,0) 0deg, rgba(255,180,80,0.75) 90deg, rgba(255,180,80,0) 180deg, rgba(255,180,80,0.4) 270deg, rgba(255,180,80,0) 360deg)",
                    mask: "radial-gradient(circle, transparent 62%, black 63%, black 66%, transparent 67%)",
                    WebkitMask:
                      "radial-gradient(circle, transparent 62%, black 63%, black 66%, transparent 67%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                />

                {/* Dashed mid ring */}
                <motion.span
                  aria-hidden
                  className="absolute w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-full border border-dashed border-amber-300/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                />

                {/* Pulsing glow */}
                <motion.span
                  aria-hidden
                  className="absolute w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,180,80,0.45) 0%, rgba(255,120,40,0.15) 45%, transparent 75%)",
                    filter: "blur(20px)",
                  }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
                />

                {/* Main disc */}
                <span
                  className="relative w-[160px] h-[160px] md:w-[210px] md:h-[210px] rounded-full flex flex-col items-center justify-center overflow-hidden
                             border border-amber-300/50 bg-black/80 backdrop-blur-sm
                             transition-all duration-500
                             group-hover:border-amber-300 group-hover:bg-black/70 group-hover:scale-[1.04]
                             group-active:scale-[0.97]
                             shadow-[0_0_60px_rgba(255,180,80,0.25)]
                             group-hover:shadow-[0_0_90px_rgba(255,180,80,0.55)]"
                >
                  {/* Subtle inner gradient */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 120%, rgba(255,180,80,0.35), transparent 60%)",
                    }}
                  />
                  {/* Sweeping highlight on hover */}
                  <span
                    aria-hidden
                    className="absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "conic-gradient(from 180deg, transparent 0%, rgba(255,220,150,0.35) 20%, transparent 40%)",
                      mask: "radial-gradient(circle, transparent 65%, black 66%)",
                      WebkitMask:
                        "radial-gradient(circle, transparent 65%, black 66%)",
                    }}
                  />

                  <span className="relative flex items-center gap-1.5 text-[10px] md:text-xs uppercase tracking-[0.4em] text-amber-300/80 font-bold mb-2">
                    <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    С музыкой
                  </span>
                  <span className="relative flex items-center gap-2 text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
                    <span>Войти</span>
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-amber-300 transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Secondary entry — muted. Positioned below the main disc so the
              primary CTA keeps its visual focal-point status.
              We wrap in a positioned div so the motion.button can animate
              opacity freely without its transform fighting the CSS centering. */}
          <AnimatePresence>
            {ready && (
              <div
                key="enter-muted-wrap"
                className="absolute left-1/2 top-1/2 z-10 pointer-events-none"
                style={{
                  // Clears the main disc (~130px radius desktop / ~105px mobile)
                  // with a comfortable gap before the bottom hint.
                  transform: "translate(-50%, calc(-50% + 200px))",
                }}
              >
                <motion.button
                  type="button"
                  onClick={handleEnterMuted}
                  onTouchEnd={handleEnterMuted}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: easeOutExpo }}
                  className="group/muted inline-flex items-center gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.3em] font-bold text-white/70 hover:text-white border border-white/20 hover:border-white/50 backdrop-blur-sm bg-black/40 hover:bg-black/60 transition-all whitespace-nowrap pointer-events-auto"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  aria-label="Войти на сайт без фоновой музыки"
                  data-cursor="view"
                  data-cursor-label="Без музыки"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Войти без музыки</span>
                </motion.button>
              </div>
            )}
          </AnimatePresence>

          {/* Bottom loading bar — fades out once ready */}
          <motion.div
            animate={{ opacity: ready ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-10 left-6 right-6 md:left-10 md:right-10 flex items-center gap-4 md:gap-6"
          >
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
          </motion.div>

          {/* Bottom hint under the button when ready */}
          <AnimatePresence>
            {ready && (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: easeOutExpo }}
                className="absolute bottom-10 left-0 right-0 text-center text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold z-10"
              >
                Нажмите, чтобы открыть сайт
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
