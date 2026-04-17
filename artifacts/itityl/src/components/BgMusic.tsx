import { useEffect, useRef } from "react";

/**
 * Background ambience — no UI.
 *
 * Browser policy ALWAYS blocks autoplay with sound on a fresh page
 * load. The workaround: start muted (allowed everywhere), then
 * attempt an unmute on every conceivable user event. The first
 * event that the browser recognizes as a user activation will
 * succeed; subsequent attempts are no-ops thanks to the `done`
 * guard.
 */
export function BgMusic({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.35;
    a.muted = true;
    a.loop = true;
    a.preload = "auto";

    // Kick off the muted playback as early as possible.
    a.play().catch(() => {});

    let done = false;
    const unmute = () => {
      if (done) return;
      a.muted = false;
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          done = true;
          cleanup();
        }).catch(() => {
          // Browser rejected — re-mute and wait for a stronger event.
          a.muted = true;
        });
      } else {
        done = true;
        cleanup();
      }
    };

    // Cast a wide net. Activation-granting per spec:
    //   keydown, pointerdown/up, touchend, mousedown, click
    // Non-activation but harmless to listen on — some browsers
    // (older Chrome, Firefox on Linux) may still treat them as
    // gestures:
    //   mousemove, pointermove, touchstart, touchmove, wheel,
    //   scroll, focus, keyup, contextmenu
    const events = [
      "pointerdown",
      "pointerup",
      "pointermove",
      "touchstart",
      "touchmove",
      "touchend",
      "mousedown",
      "mouseup",
      "mousemove",
      "click",
      "dblclick",
      "contextmenu",
      "wheel",
      "scroll",
      "keydown",
      "keyup",
      "keypress",
      "focus",
      "focusin",
    ] as const;

    const opts: AddEventListenerOptions = { capture: true, passive: true };
    const cleanup = () => {
      for (const ev of events) {
        document.removeEventListener(ev, unmute, true);
        window.removeEventListener(ev, unmute, true);
      }
    };
    for (const ev of events) {
      document.addEventListener(ev, unmute, opts);
      window.addEventListener(ev, unmute, opts);
    }
    // Also handle the case where the page becomes visible later
    // (e.g. user switched tabs and came back).
    const onVisible = () => {
      if (document.visibilityState === "visible" && !done) {
        a.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <audio ref={ref} src={src} autoPlay muted loop preload="auto" />;
}
