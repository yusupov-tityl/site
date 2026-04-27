/**
 * Audio bootstrap — runs at the EARLIEST possible point in app boot.
 *
 * Architecture (after the mobile-WebView fix)
 * ───────────────────────────────────────────
 * Two parallel audio paths with a clear primary / secondary split:
 *
 *   1. PRIMARY: HTMLAudioElement (`audioState.audio`)
 *      Plays the actual sound. Works reliably on iOS Safari, Telegram
 *      WebView, Android Chrome / Yandex Browser, and every desktop
 *      engine. The browser handles streaming + decoding for us; no
 *      manual fetch/decode pipeline that can stall on slow mobile or
 *      hit codec quirks. `.play()` is called inside the first user
 *      gesture, which satisfies every mobile autoplay policy.
 *
 *   2. SECONDARY: Web Audio API (`audioState.ctx` + AnalyserNode)
 *      Used ONLY for the 3-bar visualizer. We build the graph
 *      `mediaElementSource(audio) → analyser → destination` so the
 *      analyser can read FFT data from the same `<audio>` element.
 *      If `createMediaElementSource` throws (some WebViews don't
 *      support it), we silently skip — bars then animate purely from
 *      the synthetic oscillator and audio still plays.
 *
 * The previous design used Web Audio for playback too. That looked
 * elegant on paper but wasn't reliable: Telegram WebView and a few
 * Android browsers either reject the iOS unlock trick, fail
 * `decodeAudioData` on certain mp3 frames, or silently keep the
 * AudioContext suspended even after `resume()`. Switching primary
 * playback to a plain `<audio>` element solved all of those.
 */

const SRC = (() => {
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
  /** True when neither HTMLAudioElement nor Web Audio is available. */
  unsupported: boolean;
  /** Primary playback element. Created on module load. */
  audio: HTMLAudioElement | null;
  /** True once the audio element has actually started playing. */
  playing: boolean;
  /** True after the first user gesture has been observed. */
  unlocked: boolean;
  /** Optional Web Audio context for the FFT visualiser. */
  ctx: AudioContext | null;
  /** Analyser node for the bar visualiser. Null if Web Audio path failed. */
  analyser: AnalyserNode | null;
  /** Listeners notified on state changes. */
  onChange: Set<() => void>;
};

export const audioState: AudioState = {
  unsupported: false,
  audio: null,
  playing: false,
  unlocked: false,
  ctx: null,
  analyser: null,
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
(() => {
  if (typeof window === "undefined") return;

  // Create the primary <audio> element. Don't auto-play — that's
  // forbidden on mobile until a gesture. preload="auto" tells the
  // browser to start fetching as soon as it's idle, but the browser
  // itself decides bandwidth scheduling, so we don't peg the network
  // during hydration.
  let audio: HTMLAudioElement;
  try {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous"; // required for createMediaElementSource
    // Some WebViews need the element attached to the DOM to honour
    // play() — append it hidden. Safe on all engines.
    audio.style.display = "none";
    document.documentElement.appendChild(audio);
  } catch {
    audioState.unsupported = true;
    return;
  }
  audioState.audio = audio;

  audio.addEventListener("playing", () => {
    audioState.playing = true;
    notify();
  });
  audio.addEventListener("pause", () => {
    audioState.playing = false;
    notify();
  });

  // ── Gesture-unlock listener ───────────────────────────────────────
  // We listen ONLY for `click` and `keydown`, in BUBBLE phase. The
  // earlier capture-phase pointerdown/touchstart listener technically
  // fired before EntryGate's onClick, but several mobile WebViews
  // (Telegram, in-app Yandex/VK browsers) don't count capture-phase
  // pointerdown as a "user activation" for media-element play() —
  // which is why music only started on the SECOND click (the pill)
  // and not on the FIRST (the "Войти" button). The reliable signal
  // across every engine is a bubble-phase `click` on a real
  // interactive element, exactly what EntryGate's button dispatches.
  const events = ["click", "keydown"] as const;

  let armed = true;
  const unlock = () => {
    if (!armed) return;
    armed = false;
    audioState.unlocked = true;

    // PRIMARY: start playback. We do three things in sequence to
    // maximise the chance audio actually starts on flaky mobile
    // engines:
    //   1. audio.load() — force the element back to "loading" state
    //      and re-issue the network request if it stalled. Cheap on
    //      a fully-buffered element.
    //   2. audio.play() — gesture-bound start. On iOS this is the
    //      moment the autoplay token is granted.
    //   3. canplay retry — if play() rejected because the file wasn't
    //      buffered enough yet, the browser fires `canplay` once it
    //      has metadata + first frame. We retry then; permission from
    //      step 2 carries over so no new gesture is needed.
    try {
      audio.load();
    } catch {
      /* some engines throw if load() is called before src settles */
    }
    const tryPlay = () => {
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Permission denied OR not buffered yet. Either canplay
          // below retries, or BgMusic's pill click retries — both
          // cover the same case.
        });
      }
    };
    tryPlay();
    audio.addEventListener("canplay", tryPlay, { once: true });

    // SECONDARY: spin up Web Audio for the visualiser.
    const Ctx = getAudioContextClass();
    if (Ctx) {
      try {
        const ctx = new Ctx();
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        // iOS silent-buffer unlock — keeps Web Audio alive in case
        // anything else on the page wants it later.
        try {
          const silentBuf = ctx.createBuffer(1, 1, 22050);
          const silent = ctx.createBufferSource();
          silent.buffer = silentBuf;
          silent.connect(ctx.destination);
          silent.start(0);
        } catch {
          /* silent unlock failed — visualiser may be quiet */
        }
        // Hook the <audio> element into Web Audio so the analyser
        // sees real samples. createMediaElementSource throws on some
        // WebViews; if so, the bars fall back to the oscillator-only
        // animation in BgMusic.
        try {
          const src = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          src.connect(analyser);
          analyser.connect(ctx.destination);
          audioState.ctx = ctx;
          audioState.analyser = analyser;
        } catch {
          // Visualiser will render via the synthetic oscillator only.
          // Audio still plays via the <audio> element.
          audioState.ctx = ctx;
        }
      } catch {
        /* Web Audio path failed; <audio> still works. */
      }
    }

    notify();
    cleanup();
  };
  const cleanup = () => {
    for (const ev of events) {
      document.removeEventListener(ev, unlock);
    }
  };
  for (const ev of events) {
    // Bubble phase. We can't use `once: true` here because we want
    // armed/cleanup to be the source of truth — once any one of the
    // events fires we manually remove the others.
    document.addEventListener(ev, unlock);
  }
})();
