import { useEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { VolumeX } from "lucide-react";

/**
 * Background music pill — SOUND ON / SOUND OFF.
 *
 * Implementation notes
 * ────────────────────
 * Uses the **Web Audio API** end-to-end (AudioContext + AudioBuffer +
 * BufferSourceNode + GainNode + AnalyserNode) instead of HTMLAudioElement.
 *
 * Why: iOS Safari and Telegram's WebView block muted-autoplay on <audio>
 * elements. With <audio>, the first time the user clicks SOUND ON the
 * browser has to fetch + decode the mp3 inline — a 200-500ms perceptible
 * lag on mobile. With Web Audio we fetch the file and pre-decode it
 * during the EntryGate loader (~1.6s of "free" time), so the user's
 * click triggers an instant `bufferSource.start(0)` with a buffer that's
 * already in memory — playback starts on the same task as the gesture.
 *
 * iOS quirk: AudioContext can be CREATED before a gesture (it sits in
 * "suspended" state), and decodeAudioData() works in suspended state.
 * Only `ctx.resume()` and `source.start()` need to happen inside a real
 * user gesture. So we create + decode early, resume + start on click.
 *
 * The 3 bars to the left of the label are driven by real-time FFT data
 * from the analyser node, so they actually move to the music.
 */

const NUM_BARS = 3;
const VOLUME_STORAGE_KEY = "itityl:bg-music-volume";
const DEFAULT_VOLUME = 0.03;

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

type AudioCtxClass = typeof AudioContext;

function getAudioContextClass(): AudioCtxClass | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: AudioCtxClass }).webkitAudioContext ||
    null
  );
}

export function BgMusic({ src }: { src: string }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const startedRef = useRef(false);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const loopRunningRef = useRef(false);
  const hoverCloseTimerRef = useRef<number | null>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState<number>(() => readStoredVolume());
  const [sliderOpen, setSliderOpen] = useState(false);

  // ── Pre-fetch + pre-decode on mount ────────────────────────────────
  // Fetches the mp3 in parallel with the EntryGate loader, decodes it
  // into an AudioBuffer, and parks it in a ref ready for playback. No
  // sound is produced — that requires a user gesture (next effect).
  useEffect(() => {
    let cancelled = false;
    const Ctx = getAudioContextClass();
    if (!Ctx) return;

    const ctx = new Ctx();
    ctxRef.current = ctx;

    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelled) return Promise.reject(new Error("cancelled"));
        // Older Safari uses the callback form; the promise form is the
        // modern path and works in iOS 14.5+ and current Telegram WebView.
        return ctx.decodeAudioData(buf);
      })
      .then((decoded) => {
        if (cancelled) return;
        bufferRef.current = decoded;
      })
      .catch(() => {
        // Network failure or decode failure — the pill simply won't
        // play; the rest of the site is unaffected.
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  // ── Start playback on first user gesture ───────────────────────────
  // The same click that dismisses the EntryGate IS the gesture that
  // unlocks audio on iOS. We listen at the document level with capture
  // so we beat the EntryGate's own onClick handler to the punch.
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done || startedRef.current) return;
      const ctx = ctxRef.current;
      const buffer = bufferRef.current;
      if (!ctx) return;
      done = true;

      // Resume the context (no-op on Chrome, required on iOS).
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      // If the buffer hasn't finished decoding yet (very fast clicks
      // through the loader on a slow network), wait for it. We retry
      // every 80ms for up to 5s; if it never arrives, silently give up.
      let waited = 0;
      const tryStart = () => {
        const buf = bufferRef.current;
        if (!buf) {
          if (waited > 5000) return;
          waited += 80;
          window.setTimeout(tryStart, 80);
          return;
        }
        startSource(buf);
      };
      if (buffer) startSource(buffer);
      else tryStart();

      cleanup();
    };

    const events = [
      "pointerdown",
      "pointerup",
      "touchend",
      "touchstart",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wires the audio graph and starts looping playback. Idempotent —
  // safe to call once after first gesture; subsequent toggles use the
  // gain node, not new sources.
  const startSource = (buffer: AudioBuffer) => {
    const ctx = ctxRef.current;
    if (!ctx || startedRef.current) return;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      // Apply the user's stored volume immediately. soundOn=true on
      // first start, so no muting needed here.
      gain.gain.value = volume;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;

      // Graph: source → gain → analyser → destination. Analyser is a
      // tap, not an attenuator, so it doesn't affect volume.
      source.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      sourceRef.current = source;
      gainRef.current = gain;
      analyserRef.current = analyser;

      // start(0) plays immediately on the audio clock — synchronous on
      // the gesture task, no perceptible delay even on mobile.
      source.start(0);
      startedRef.current = true;
      runLoop();
    } catch {
      // Some browsers reject duplicate start() — ignore.
    }
  };

  // ── Volume / mute synchronization ──────────────────────────────────
  // Volume changes flow into both the GainNode (audible) and
  // localStorage (persistent across sessions).
  useEffect(() => {
    const gain = gainRef.current;
    if (gain && soundOn) {
      gain.gain.value = volume;
    }
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      // private mode / quota — accept session-only persistence.
    }
  }, [volume, soundOn]);

  // ── FFT-driven bar visualiser ──────────────────────────────────────
  // Three bars whose heights are driven by per-band frequency energy
  // plus a sin/cos "runner" that gives a lively bottom↔top sweep even
  // during quiet passages.
  const runLoop = () => {
    if (loopRunningRef.current) return;
    const analyser = analyserRef.current;
    const buf = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const bins = analyser?.frequencyBinCount ?? 0;
    const bands = [
      { center: 0.04, width: 3 }, // sub-bass / kick
      { center: 0.18, width: 4 }, // mids / vocals
      { center: 0.55, width: 6 }, // highs / hats
    ];
    const oscA = { speed: [4.1, 5.3, 6.7], phase: [0, 1.7, 3.4] };
    const oscB = { speed: [7.3, 9.1, 10.9], phase: [0.8, 2.6, 4.2] };
    const t0 = performance.now();
    loopRunningRef.current = true;

    const tick = () => {
      if (!loopRunningRef.current) return;
      const live = analyserRef.current;
      if (live && buf) live.getByteFrequencyData(buf);
      const t = (performance.now() - t0) / 1000;
      for (let i = 0; i < NUM_BARS; i++) {
        let avg = 0;
        if (live && buf && bins > 0) {
          const band = bands[i];
          const centerIdx = Math.floor(bins * band.center);
          const half = band.width;
          let sum = 0;
          let count = 0;
          for (let k = -half; k <= half; k++) {
            const j = centerIdx + k;
            if (j >= 0 && j < bins) {
              sum += buf[j];
              count++;
            }
          }
          avg = count > 0 ? sum / count / 255 : 0;
        }
        const fft = Math.min(1, Math.pow(avg, 0.5) * 1.75);
        const sA = 0.5 + 0.5 * Math.sin(t * oscA.speed[i] + oscA.phase[i]);
        const sB = 0.5 + 0.5 * Math.sin(t * oscB.speed[i] + oscB.phase[i]);
        const runner = (sA + sB) / 2;
        const spike = fft * 0.3;
        const scale = Math.min(1, 0.05 + runner * 0.9 + spike);
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

  // Pause/resume bar animation when tab visibility changes.
  useEffect(() => {
    if (soundOn && !document.hidden && startedRef.current) runLoop();
    const onVis = () => {
      if (document.hidden) stopLoop();
      else if (soundOn && startedRef.current) runLoop();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stopLoop();
    };
  }, [soundOn]);

  // ── Toggle SOUND ON / OFF ──────────────────────────────────────────
  // No source teardown — just ride the GainNode. This is what makes
  // toggle instant on every platform: changing gain.value is a single
  // synchronous parameter write on the audio thread.
  const toggle = () => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    const next = !soundOn;
    setSoundOn(next);

    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    if (next) {
      if (gain) gain.gain.value = volume;
      // If for some reason the source never started (e.g. user clicked
      // SOUND OFF before the buffer finished decoding), kick it off now.
      if (!startedRef.current && bufferRef.current) {
        startSource(bufferRef.current);
      }
      runLoop();
    } else {
      if (gain) gain.gain.value = 0;
      stopLoop();
    }
  };

  // ── Hover-intent for the volume popover ────────────────────────────
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

  // ── Cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopLoop();
      try {
        sourceRef.current?.stop();
      } catch {
        /* already stopped */
      }
      sourceRef.current?.disconnect();
      gainRef.current?.disconnect();
      analyserRef.current?.disconnect();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const volumePct = Math.round(volume * 100);

  return (
    <>
      <style>{`
        .bg-music-pill { height: 44px; }
        @media (min-width: 768px) {
          .bg-music-pill { height: 50px; }
        }
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
                      ? "rgb(252 211 77)"
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
                  style={{ transform: "scaleY(0.3)", transition: "transform 35ms linear" }}
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
