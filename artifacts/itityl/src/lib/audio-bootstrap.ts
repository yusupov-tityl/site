/**
 * Audio bootstrap — runs at the EARLIEST possible point in app boot.
 *
 * Why this exists
 * ───────────────
 * The BgMusic component is lazy-loaded as a separate chunk to keep
 * the initial bundle slim. On slow mobile connections the chunk may
 * not arrive before the user clicks "Войти" — and that click is
 * THE one and only chance to unlock the AudioContext on iOS / Telegram
 * WebView. Miss it, and audio is dead for the rest of the session.
 *
 * This module is imported eagerly from main.tsx so it runs before
 * React mounts. It:
 *   1. Creates the AudioContext immediately (in suspended state).
 *   2. Kicks off fetch + decode of the mp3 in parallel with React boot.
 *   3. Registers a one-shot, capture-phase document listener for the
 *      first user gesture. Inside that gesture it runs the iOS unlock
 *      trick (1-sample silent buffer started synchronously) and, if
 *      the real buffer is already decoded, starts the music too.
 *
 * BgMusic, when it eventually mounts, just reads `audioState` and
 * subscribes to volume / mute changes. It never owns the AudioContext.
 */

const SRC = (() => {
  // import.meta.env.BASE_URL is "/" in production, "/<base>/" otherwise.
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}/bg-music.mp3`;
})();

type AudioCtxClass = typeof AudioContext;

function getAudioContextClass(): AudioCtxClass | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: AudioCtxClass })
      .webkitAudioContext ||
    null
  );
}

export type AudioState = {
  /** True when Web Audio is unavailable on this client. */
  unsupported: boolean;
  /** The shared AudioContext, or null if unsupported / construction failed. */
  ctx: AudioContext | null;
  /** Decoded mp3 buffer. May be null until the network fetch completes. */
  buffer: AudioBuffer | null;
  /** True after the iOS unlock trick has run inside a user gesture. */
  unlocked: boolean;
  /** Listeners notified on state changes (buffer ready, unlocked, etc). */
  onChange: Set<() => void>;
};

export const audioState: AudioState = {
  unsupported: false,
  ctx: null,
  buffer: null,
  unlocked: false,
  onChange: new Set(),
};

function notify() {
  for (const fn of audioState.onChange) {
    try {
      fn();
    } catch {
      /* noop */
    }
  }
}

// ── Boot sequence ───────────────────────────────────────────────────
// Wrapped in IIFE so import side-effects run once on module load.
(() => {
  if (typeof window === "undefined") return;

  const Ctx = getAudioContextClass();
  if (!Ctx) {
    audioState.unsupported = true;
    return;
  }

  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    audioState.unsupported = true;
    return;
  }
  audioState.ctx = ctx;

  // Defer the 2.2 MB mp3 fetch + decode until either the browser is
  // idle OR the first user gesture. Previously we fired the fetch
  // synchronously on module load, which (a) competed with the critical
  // JS bundle for bandwidth on every page (we now ship audio-bootstrap
  // on every route, not just home), and (b) pegged a CPU core during
  // decodeAudioData right when React was hydrating — visible as scroll
  // jank on mid-range mobile.
  // The gesture listener below still fires immediately; if the user
  // clicks "Войти" before the buffer arrives, BgMusic just waits for
  // the buffer via the audioState notify callback. UX is unchanged.
  let fetchStarted = false;
  const startFetch = () => {
    if (fetchStarted) return;
    fetchStarted = true;
    fetch(SRC)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        audioState.buffer = decoded;
        notify();
      })
      .catch(() => {
        // Network or decode failure — pill will stay silent, nothing
        // else breaks. Notify anyway so listeners can re-render.
        notify();
      });
  };
  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (idle) {
    idle(startFetch, { timeout: 3000 });
  } else {
    // Safari has no requestIdleCallback; settle after first paint.
    setTimeout(startFetch, 1500);
  }

  // ── Gesture-unlock listener ───────────────────────────────────────
  // Registered at module-load time so it's in place LONG before any
  // React component mounts. Capture phase + once: it fires before any
  // bubble-phase handlers (including EntryGate's onClick) and only
  // for the first event of each kind.
  const events = [
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend",
    "mousedown",
    "click",
    "keydown",
  ] as const;

  let armed = true;
  const unlock = () => {
    if (!armed) return;
    armed = false;

    const c = audioState.ctx;
    if (!c) return;

    // If idle hasn't fired yet (fast click on slow CPU), kick off the
    // mp3 fetch right now — we want the buffer ready ASAP since the
    // user has shown intent.
    startFetch();

    // Resume — synchronous-in-effect inside a gesture on iOS.
    if (c.state === "suspended") {
      c.resume().catch(() => {});
    }

    // The 1-sample silent buffer trick. iOS marks the context as
    // user-unlocked after this; subsequent start() calls work even
    // outside a gesture.
    try {
      const silentBuf = c.createBuffer(1, 1, 22050);
      const silent = c.createBufferSource();
      silent.buffer = silentBuf;
      silent.connect(c.destination);
      silent.start(0);
      audioState.unlocked = true;
    } catch {
      /* even silent failed — give up */
    }

    notify();
    cleanup();
  };
  const cleanup = () => {
    for (const ev of events) {
      document.removeEventListener(ev, unlock, true);
    }
  };
  for (const ev of events) {
    document.addEventListener(ev, unlock, { capture: true, once: true });
  }
})();
