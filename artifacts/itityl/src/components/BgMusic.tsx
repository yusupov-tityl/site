import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Background ambience. Starts MUTED autoplay (the only kind browsers
 * allow without a user gesture), then unmutes on first user
 * interaction if the visitor hasn't explicitly clicked "mute" yet.
 *
 * A floating icon in the bottom-right lets the user toggle sound.
 */
export function BgMusic({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const userChoseRef = useRef(false);

  // Try to begin muted playback ASAP.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.35;
    const p = a.play();
    if (p) p.catch(() => {});
  }, []);

  // On first user interaction, auto-unmute (unless the user already
  // flipped the toggle themselves).
  useEffect(() => {
    const unmuteOnce = () => {
      if (userChoseRef.current) return;
      const a = ref.current;
      if (!a) return;
      a.muted = false;
      setMuted(false);
      a.play().catch(() => {});
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", unmuteOnce);
      window.removeEventListener("keydown", unmuteOnce);
      window.removeEventListener("scroll", unmuteOnce);
    };
    window.addEventListener("pointerdown", unmuteOnce, { once: true });
    window.addEventListener("keydown", unmuteOnce, { once: true });
    window.addEventListener("scroll", unmuteOnce, { once: true, passive: true });
    return cleanup;
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    userChoseRef.current = true;
    const next = !muted;
    a.muted = next;
    setMuted(next);
    if (!next) a.play().catch(() => {});
  };

  return (
    <>
      <audio ref={ref} src={src} autoPlay muted loop preload="auto" />
      <button
        type="button"
        aria-label={muted ? "Включить звук" : "Выключить звук"}
        onClick={toggle}
        data-cursor="link"
        className="fixed bottom-6 right-6 z-[90] w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/25 bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:border-amber-300/60 hover:bg-black/70 transition-colors duration-300"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </>
  );
}
