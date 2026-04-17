import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Background ambience.
 *
 * UX model: the toggle is conceptually ON by default. Audio starts
 * audibly playing as soon as the browser allows — either via muted
 * autoplay that we un-mute on the first gesture, or directly after
 * the first click if autoplay was refused.
 *
 * `wantsSound` is the authoritative visual state (icon). The actual
 * <audio>.muted value follows it as soon as the browser permits
 * un-muted playback.
 */
export function BgMusic({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [wantsSound, setWantsSound] = useState(true);

  // Muted autoplay on mount — virtually always allowed.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.35;
    a.muted = true;
    a.play().catch(() => {});
  }, []);

  // On the first user gesture, sync <audio>.muted with wantsSound and
  // (re)start playback. Uses capture-phase document listeners so
  // Lenis / other scroll libs can't swallow the event.
  useEffect(() => {
    let done = false;
    const sync = () => {
      if (done) return;
      done = true;
      const a = ref.current;
      if (!a) return;
      a.muted = !wantsSound;
      a.play().catch(() => {});
      cleanup();
    };
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
      for (const e of events) document.removeEventListener(e, sync, true);
    };
    for (const e of events) {
      document.addEventListener(e, sync, { capture: true, once: true });
    }
    return cleanup;
  }, [wantsSound]);

  const toggle = () => {
    const a = ref.current;
    const next = !wantsSound;
    setWantsSound(next);
    if (!a) return;
    a.muted = !next;
    if (next) a.play().catch(() => {});
  };

  return (
    <>
      <audio ref={ref} src={src} autoPlay muted loop preload="auto" />
      <button
        type="button"
        aria-label={wantsSound ? "Выключить звук" : "Включить звук"}
        title={wantsSound ? "Выключить звук" : "Включить звук"}
        onClick={toggle}
        data-cursor="link"
        className="fixed bottom-6 right-6 z-[90] w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/25 bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:border-amber-300/60 hover:bg-black/70 transition-colors duration-300"
      >
        {wantsSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
    </>
  );
}
