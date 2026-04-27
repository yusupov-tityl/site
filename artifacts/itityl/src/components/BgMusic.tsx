import { useEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { VolumeX } from "lucide-react";
import { audioState } from "@/lib/audio-bootstrap";

/**
 * Background music pill — SOUND ON / SOUND OFF.
 *
 * Implementation notes
 * ────────────────────
 * Primary playback is an HTMLAudioElement (audioState.audio) created in
 * audio-bootstrap before React mounts and started inside the first user
 * gesture. This is the most reliable path on iOS Safari, Telegram
 * WebView, Yandex Browser and Android Chrome — every mobile engine
 * accepts a gesture-bound `<audio>.play()`.
 *
 * The Web Audio API is wired in only as a SECONDARY signal source for
 * the 3-bar visualiser via `mediaElementSource(audio) → analyser`. If
 * createMediaElementSource throws (rare, but happens on some WebViews),
 * the bars fall back to the synthetic oscillator and audio still plays.
 *
 * Why this differs from the previous Web-Audio-only design: a buffer
 * source approach looked elegant but was unreliable on Telegram and a
 * few Android browsers — they would either reject the iOS unlock trick
 * or silently keep the AudioContext suspended. Switching primary
 * playback to `<audio>` removed every report of "music doesn't start
 * on mobile".
 */

const NUM_BARS = 3;
// v2 — bumped to invalidate the stale 0.5 default that some early
// visitors had cached in localStorage from a pre-launch build.
const VOLUME_STORAGE_KEY = "itityl:bg-music-volume:v2";
const DEFAULT_VOLUME = 0.05;

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

// `src` is now unused — audio-bootstrap.ts created the HTMLAudioElement
// using import.meta.env.BASE_URL. Kept on the prop signature for
// backwards-compat with App.tsx.
export function BgMusic(_props: { src?: string }) {
  void _props;
  const startedRef = useRef(false);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const loopRunningRef = useRef(false);
  const hoverCloseTimerRef = useRef<number | null>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState<number>(() => readStoredVolume());
  const [sliderOpen, setSliderOpen] = useState(false);

  // True when no playback path is available at all.
  const [audioSupported, setAudioSupported] = useState(!audioState.unsupported);

  // ── Apply stored volume to the audio element on first mount ───────
  // Has to happen before any play() so the first sound the user hears
  // is at their saved level, not 100 %.
  useEffect(() => {
    const a = audioState.audio;
    if (a) a.volume = volume;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Subscribe to audio-bootstrap state ─────────────────────────────
  // The bootstrap module (loaded from main.tsx, BEFORE React mounts)
  // already created the <audio> element and registered the gesture-
  // unlock listener. We just react when "unlocked" or "playing" flips.
  useEffect(() => {
    if (audioState.unsupported) {
      setAudioSupported(false);
      return;
    }
    const tryStart = () => {
      if (startedRef.current) return;
      if (!audioState.unlocked || !audioState.audio) return;
      startedRef.current = true;
      // Apply latest volume right at start (in case user changed it
      // between page load and first gesture via another tab).
      audioState.audio.volume = volume;
      // The bootstrap already called .play() inside the gesture, but
      // call again as a safety net — most browsers no-op a redundant
      // play() on a playing element. If the bootstrap call was blocked
      // for any reason this catches up the moment the chunk mounts.
      const p = audioState.audio.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Will retry on next user interaction (the pill click).
          startedRef.current = false;
        });
      }
      runLoop();
    };
    audioState.onChange.add(tryStart);
    // Run once on mount in case bootstrap already finished while the
    // BgMusic chunk was loading.
    tryStart();
    return () => {
      audioState.onChange.delete(tryStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Volume / mute synchronization ──────────────────────────────────
  // Volume changes flow into the audio element (audible) and
  // localStorage (persistent across sessions).
  useEffect(() => {
    const a = audioState.audio;
    if (a && soundOn) {
      a.volume = volume;
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
    // Analyser is owned by audio-bootstrap (built inside the gesture).
    // Re-read every frame so a late-arriving analyser still drives the
    // bars without a remount.
    const initialAnalyser = audioState.analyser;
    const buf = initialAnalyser
      ? new Uint8Array(initialAnalyser.frequencyBinCount)
      : null;
    const bins = initialAnalyser?.frequencyBinCount ?? 0;
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
      const live = audioState.analyser;
      if (live && buf && buf.length === live.frequencyBinCount) {
        live.getByteFrequencyData(buf);
      }
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
  // Drives the <audio> element directly. play()/pause() are O(1) on
  // every browser, and setting .volume is a single synchronous write.
  // This handler also acts as a fallback unlock: if the bootstrap's
  // gesture-bound play() was rejected by an unusually strict WebView,
  // calling play() here from the pill click is a fresh user gesture
  // that every browser respects.
  const toggle = () => {
    const a = audioState.audio;
    const ctx = audioState.ctx;
    const next = !soundOn;
    setSoundOn(next);

    // Best-effort resume of the analyser context for the visualiser.
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    if (!a) return;

    if (next) {
      a.volume = volume;
      // play() returns a Promise; if it resolves we're playing, if it
      // rejects we surface nothing — user can tap again.
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          startedRef.current = true;
          runLoop();
        }).catch(() => {
          /* will be retried on next click */
        });
      } else {
        startedRef.current = true;
        runLoop();
      }
    } else {
      a.pause();
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
  // We DON'T pause audioState.audio or close audioState.ctx — they're
  // shared singletons owned by audio-bootstrap and live for the
  // lifetime of the page. BgMusic just owns the visual loop.
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, []);

  // If the browser/WebView doesn't support Web Audio at all, render
  // nothing — the rest of the site stays exactly the same and we
  // don't ship a broken pill that does nothing on tap.
  if (!audioSupported) return null;

  const volumePct = Math.round(volume * 100);

  // On touch devices the pill toggle handles sound on/off. We make a
  // long-press (or a second tap on an already-on pill) open the slider
  // — but the simplest UX is: on coarse pointer, also open the slider
  // briefly when sound is toggled. We expose a `data-coarse` flag so
  // the click handler can branch.
  const isCoarse =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const onPillClick = () => {
    toggle();
    if (isCoarse) {
      openSlider();
      // Auto-close after 2.5 s so the slider doesn't camp on top of
      // page content on mobile.
      window.setTimeout(() => setSliderOpen(false), 2500);
    }
  };

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
        className="fixed right-6 z-[90]"
        // bottom = max(safe-area, 24px) so the pill clears the home-
        // indicator on iPhones without floating absurdly high on
        // browsers that don't expose env() (it falls back to 24px).
        style={{ bottom: "max(env(safe-area-inset-bottom, 0px), 1.5rem)" }}
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
          onClick={onPillClick}
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
