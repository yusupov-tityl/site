import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Background ambience.
 *
 * Browsers block NON-muted autoplay; so we:
 *   1. Start MUTED autoplay on mount (best-effort, often allowed).
 *   2. On *any* user interaction (capture phase on document — survives
 *      stopPropagation by smooth-scroll libs etc.), call play() + unmute.
 *   3. A pulsing button bottom-right is the guaranteed fallback: one tap
 *      starts (or silences) audio regardless of what the browser's
 *      autoplay policy says.
 */
export function BgMusic({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const userChoseRef = useRef(false);

  // 1) Muted autoplay on mount.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.35;
    a.muted = true;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Even muted autoplay refused — will be started on first gesture.
      });
  }, []);

  // 2) On first gesture anywhere: unmute + ensure playback.
  useEffect(() => {
    const start = () => {
      if (userChoseRef.current) return cleanup();
      const a = ref.current;
      if (!a) return cleanup();
      a.muted = false;
      setMuted(false);
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
      cleanup();
    };
    const opts: AddEventListenerOptions = { capture: true, once: true };
    const events = [
      "pointerdown",
      "pointerup",
      "touchstart",
      "touchend",
      "mousedown",
      "click",
      "keydown",
      "wheel",
    ] as const;
    const cleanup = () => {
      for (const e of events) document.removeEventListener(e, start, true);
    };
    for (const e of events) document.addEventListener(e, start, opts);
    return cleanup;
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    userChoseRef.current = true;
    if (!playing || muted) {
      a.muted = false;
      setMuted(false);
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      a.muted = true;
      setMuted(true);
    }
  };

  const soundOn = playing && !muted;

  return (
    <>
      <audio ref={ref} src={src} autoPlay muted loop preload="auto" />
      <button
        type="button"
        aria-label={soundOn ? "Выключить звук" : "Включить звук"}
        title={soundOn ? "Выключить звук" : "Включить звук"}
        onClick={toggle}
        data-cursor="link"
        className={`fixed bottom-6 right-6 z-[90] w-12 h-12 md:w-14 md:h-14 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
          soundOn
            ? "border-amber-300/60 bg-black/60 text-amber-300"
            : "border-white/30 bg-black/60 text-white/90 hover:text-white hover:border-amber-300/60"
        }`}
      >
        {/* Pulse ring — draws attention when sound is off */}
        {!soundOn && (
          <span
            className="absolute inset-0 rounded-full border border-amber-300/50 animate-ping"
            aria-hidden
          />
        )}
        {soundOn ? (
          <Volume2 className="relative w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <VolumeX className="relative w-5 h-5 md:w-6 md:h-6" />
        )}
      </button>
    </>
  );
}
