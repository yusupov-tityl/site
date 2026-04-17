import { useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";

/**
 * Background music pill — SOUND ON / SOUND OFF.
 *
 * Starts muted-autoplay on mount; the EntryGate click provides a
 * real user activation so as soon as the gate lifts the audio is
 * unmuted and playing. The pill lets the visitor toggle afterwards.
 */

function EqBars({ active }: { active: boolean }) {
  // 4 bars, staggered animation — only visible when sound is on.
  const delays = [0, 0.15, 0.3, 0.45];
  return (
    <span
      aria-hidden
      className="flex items-end gap-[3px] h-4 w-5"
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      {delays.map((d, i) => (
        <span
          key={i}
          className="w-[3px] bg-amber-300 rounded-[1px]"
          style={{
            animation: `bg-music-bar 0.9s ease-in-out ${d}s infinite`,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </span>
  );
}

export function BgMusic({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [soundOn, setSoundOn] = useState(true); // default-on visual
  const userChoseRef = useRef(false);

  // 1) Muted autoplay on mount.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.35;
    a.muted = true;
    a.play().catch(() => {});
  }, []);

  // 2) First real user activation (EntryGate click covers it) unmutes.
  useEffect(() => {
    let done = false;
    const unmute = () => {
      if (done || userChoseRef.current) return;
      const a = ref.current;
      if (!a) return;
      done = true;
      a.muted = false;
      a.play()
        .then(() => setSoundOn(true))
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
      for (const e of events) document.removeEventListener(e, unmute, true);
    };
    for (const e of events) {
      document.addEventListener(e, unmute, { capture: true, once: true });
    }
    return cleanup;
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    userChoseRef.current = true;
    const next = !soundOn;
    setSoundOn(next);
    a.muted = !next;
    if (next) a.play().catch(() => {});
  };

  return (
    <>
      <audio ref={ref} src={src} autoPlay muted loop preload="auto" />
      <style>{`
        @keyframes bg-music-bar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
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
        {soundOn ? (
          <EqBars active />
        ) : (
          <VolumeX className="w-5 h-5 text-white/80" />
        )}
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
