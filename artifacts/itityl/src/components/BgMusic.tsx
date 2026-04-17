import { useEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { VolumeX } from "lucide-react";

/**
 * Background music pill — SOUND ON / SOUND OFF.
 *
 * When ON, the three bars to the left of the label are driven by
 * real-time frequency data from the audio via an AnalyserNode —
 * they actually move to the beat of the track.
 *
 * Audio starts muted-autoplay on mount; the EntryGate click is a
 * real user activation, so on the first such gesture the element
 * is unmuted AND the AudioContext (which browsers require to be
 * created inside a gesture) is wired up.
 */

const NUM_BARS = 3;
const VOLUME_STORAGE_KEY = "itityl:bg-music-volume";
const DEFAULT_VOLUME = 0.35;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const readStoredVolume = (): number => {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw === null) return DEFAULT_VOLUME;
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return DEFAULT_VOLUME;
    return clamp01(n);
  } catch {
    return DEFAULT_VOLUME;
  }
};

export function BgMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState<number>(() => readStoredVolume());
  const [sliderOpen, setSliderOpen] = useState(false);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const userChoseRef = useRef(false);

  // Start muted autoplay, at the user's saved volume.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = true;
    a.crossOrigin = "anonymous";
    a.play().catch(() => {});
    // Only on mount — subsequent volume changes go through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the <audio> element and localStorage in sync with the slider state.
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      // private-mode / quota — silently accept that the value is session-only.
    }
  }, [volume]);

  // Wire up Web Audio analyser — must happen INSIDE a user gesture,
  // otherwise Chrome creates the context in "suspended" state.
  const ensureAnalyser = () => {
    if (analyserRef.current) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      const Ctx: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(a);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      runLoop();
    } catch {
      // createMediaElementSource can only be called once per element;
      // ignore duplicate-source errors on re-entry.
    }
  };

  // Drive bar heights from the FFT. We stop the rAF completely whenever
  // the audio is muted or the tab is hidden — bars are invisible in those
  // cases anyway, so we should not burn 60 FPS of CPU reading the FFT.
  const loopRunningRef = useRef(false);
  const runLoop = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    if (loopRunningRef.current) return; // already ticking
    const buf = new Uint8Array(analyser.frequencyBinCount);
    // Pick three spread-out bins for low / mid / high.
    const bins = analyser.frequencyBinCount;
    const idx = [
      Math.floor(bins * 0.06),
      Math.floor(bins * 0.18),
      Math.floor(bins * 0.42),
    ];
    loopRunningRef.current = true;
    const tick = () => {
      if (!loopRunningRef.current) return;
      analyser.getByteFrequencyData(buf);
      for (let i = 0; i < NUM_BARS; i++) {
        const v = buf[idx[i]] / 255; // 0..1
        // Amplify low activity so silent passages still wiggle a bit.
        const eased = Math.min(1, Math.pow(v, 0.85) * 1.35);
        const scale = 0.25 + eased * 0.75; // floor 25%
        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${scale.toFixed(3)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    tick();
  };
  const stopLoop = () => {
    loopRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  };

  // Pause/resume the FFT loop when the tab visibility changes.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        stopLoop();
      } else if (soundOn) {
        runLoop();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stopLoop();
    };
  }, [soundOn]);

  // First real gesture: unmute + resume context + start analyser.
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done || userChoseRef.current) return;
      const a = audioRef.current;
      if (!a) return;
      done = true;
      a.muted = false;
      a.play()
        .then(() => {
          ensureAnalyser();
          setSoundOn(true);
        })
        .catch(() => {});
      cleanup();
    };
    const events = [
      "pointerdown",
      "pointerup",
      "touchend",
      "mousedown",
      "click",
      "keydown",
    ] as const;
    const cleanup = () => {
      for (const e of events) document.removeEventListener(e, start, true);
    };
    for (const e of events) {
      document.addEventListener(e, start, { capture: true, once: true });
    }
    return cleanup;
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    userChoseRef.current = true;
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      a.muted = false;
      ctxRef.current?.resume().catch(() => {});
      a.play()
        .then(() => ensureAnalyser())
        .catch(() => {});
    } else {
      a.muted = true;
      // Bars are hidden anyway when soundOn is false — don't keep reading
      // the FFT at 60 FPS in the background.
      stopLoop();
    }
  };

  // Hover intent with a small close-delay so the mouse can travel from the
  // pill to the slider without the popover snapping shut on the way.
  const openSlider = () => {
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    setSliderOpen(true);
  };
  const scheduleCloseSlider = () => {
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
    }
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      setSliderOpen(false);
    }, 180);
  };
  useEffect(() => {
    return () => {
      if (hoverCloseTimerRef.current !== null) {
        window.clearTimeout(hoverCloseTimerRef.current);
      }
    };
  }, []);

  const volumePct = Math.round(volume * 100);

  return (
    <>
      {/* preload="metadata" — fetch only ~10KB of headers on mount instead
          of the full 2MB mp3; the rest streams in once the user actually
          unmutes via the EntryGate click. */}
      <audio ref={audioRef} src={src} autoPlay muted loop preload="metadata" />
      <style>{`
        .bg-music-pill { height: 44px; }
        @media (min-width: 768px) {
          .bg-music-pill { height: 50px; }
        }
        /* Native range input, themed to match the pill (amber when on, white when off). */
        .bg-music-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            var(--bgm-fill) 0%,
            var(--bgm-fill) var(--bgm-pct),
            rgba(255,255,255,0.18) var(--bgm-pct),
            rgba(255,255,255,0.18) 100%
          );
          outline: none;
          cursor: pointer;
        }
        .bg-music-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: var(--bgm-fill);
          border: 2px solid rgba(0,0,0,0.6);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
          cursor: pointer;
        }
        .bg-music-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: var(--bgm-fill);
          border: 2px solid rgba(0,0,0,0.6);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
          cursor: pointer;
        }
        .bg-music-range::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: transparent;
        }
      `}</style>
      <div
        className="fixed bottom-6 right-6 z-[90]"
        onMouseEnter={openSlider}
        onMouseLeave={scheduleCloseSlider}
      >
        {/* Volume popover — appears above the pill on hover, or while
            dragging the slider. Staying inside the same wrapper means the
            hover-intent timer keeps it open as the mouse travels. */}
        <AnimatePresence>
          {sliderOpen && (
            <motion.div
              key="vol"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className={`absolute bottom-full right-0 mb-2 flex items-center gap-3 px-4 py-3 min-w-[200px]
                rounded-full border backdrop-blur-md
                ${
                  soundOn
                    ? "bg-black/70 border-amber-300/60 shadow-[0_0_24px_rgba(255,180,80,0.25)]"
                    : "bg-black/70 border-white/25"
                }`}
              onFocus={openSlider}
              onBlur={scheduleCloseSlider}
            >
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={volumePct}
                aria-label="Громкость"
                data-cursor="link"
                onChange={(e) => setVolume(clamp01(Number(e.target.value) / 100))}
                className="bg-music-range"
                style={
                  {
                    ["--bgm-pct" as string]: `${volumePct}%`,
                    ["--bgm-fill" as string]: soundOn
                      ? "rgb(252 211 77)" // amber-300
                      : "rgba(255,255,255,0.7)",
                  } as React.CSSProperties
                }
              />
              <span
                className={`w-9 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums ${
                  soundOn ? "text-amber-300" : "text-white/70"
                }`}
                aria-hidden
              >
                {volumePct}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          aria-label={soundOn ? "Sound off" : "Sound on"}
          title={soundOn ? "Sound off" : "Sound on"}
          onClick={toggle}
          data-cursor="link"
          className={`bg-music-pill pl-4 pr-5 flex items-center gap-3
            rounded-full border backdrop-blur-md transition-all duration-300
            ${
              soundOn
                ? "bg-black/70 border-amber-300/60 shadow-[0_0_24px_rgba(255,180,80,0.25)]"
                : "bg-black/60 border-white/25 hover:border-white/50"
            }`}
        >
          {/* Single fixed-size slot so Sound On and Sound Off render at
              identical widths. When ON: 3 FFT bars (kept mounted so the
              rAF loop keeps hitting them). When OFF: muted icon in the
              same 20×16 box. */}
          <span
            aria-hidden
            className="relative flex items-end justify-center h-4 w-5"
          >
            <span
              className="absolute inset-0 flex items-end gap-[3px]"
              style={{ visibility: soundOn ? "visible" : "hidden" }}
            >
              {Array.from({ length: NUM_BARS }).map((_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    barsRef.current[i] = el;
                  }}
                  className="w-[3px] h-full bg-amber-300 rounded-[1px] origin-bottom"
                  style={{ transform: "scaleY(0.3)", transition: "transform 60ms linear" }}
                />
              ))}
            </span>
            {!soundOn && <VolumeX className="w-5 h-5 text-white/80" />}
          </span>
          <span
            className={`flex flex-col items-start leading-none font-bold uppercase tracking-[0.18em] text-[10px] md:text-[11px] transition-colors duration-300 ${
              soundOn ? "text-amber-300" : "text-white/70"
            }`}
          >
            <span>Sound</span>
            <span className="mt-0.5">{soundOn ? "On" : "Off"}</span>
          </span>
        </button>
      </div>
    </>
  );
}
