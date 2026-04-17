import { useEffect, useRef, useState } from "react";
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

export function BgMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const [soundOn, setSoundOn] = useState(true);
  const userChoseRef = useRef(false);

  // Start muted autoplay.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;
    a.muted = true;
    a.crossOrigin = "anonymous";
    a.play().catch(() => {});
  }, []);

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

  // Drive bar heights from the FFT.
  const runLoop = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    // Pick three spread-out bins for low / mid / high.
    const bins = analyser.frequencyBinCount;
    const idx = [
      Math.floor(bins * 0.06),
      Math.floor(bins * 0.18),
      Math.floor(bins * 0.42),
    ];
    const tick = () => {
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

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} autoPlay muted loop preload="auto" />
      <style>{`
        .bg-music-pill { height: 44px; }
        @media (min-width: 768px) {
          .bg-music-pill { height: 50px; }
        }
      `}</style>
      <button
        type="button"
        aria-label={soundOn ? "Sound off" : "Sound on"}
        title={soundOn ? "Sound off" : "Sound on"}
        onClick={toggle}
        data-cursor="link"
        className={`bg-music-pill fixed bottom-6 right-6 z-[90] pl-4 pr-5 flex items-center gap-3
          rounded-full border backdrop-blur-md transition-all duration-300
          ${
            soundOn
              ? "bg-black/70 border-amber-300/60 shadow-[0_0_24px_rgba(255,180,80,0.25)]"
              : "bg-black/60 border-white/25 hover:border-white/50"
          }`}
      >
        <span
          aria-hidden
          className="flex items-end gap-[3px] h-4 w-5"
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
        <span
          className={`flex flex-col items-start leading-none font-bold uppercase tracking-[0.18em] text-[10px] md:text-[11px] transition-colors duration-300 ${
            soundOn ? "text-amber-300" : "text-white/70"
          }`}
        >
          <span>Sound</span>
          <span className="mt-0.5">{soundOn ? "On" : "Off"}</span>
        </span>
      </button>
    </>
  );
}
