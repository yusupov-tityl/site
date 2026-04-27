/**
 * Video bootstrap — universal muted-autoplay nudger.
 *
 * Why this exists
 * ───────────────
 * Several WebViews (Telegram, in-app Yandex / VK browsers, some older
 * Android Chrome forks) refuse `<video autoplay muted playsInline>` even
 * though every spec says they shouldn't. The native iOS play overlay
 * shows up instead of the looping clip. Once the user has produced ANY
 * gesture on the page, those engines will happily play() the same
 * element — they just won't do it on their own.
 *
 * The HeroBackdrop video has its own retry plumbing because it's the
 * LCP element. But we also have:
 *   – ServicesList preview clips (lg-only, less critical)
 *   – Team member portrait clips on the home page
 * …and any future <video> sprinkled into content. Rather than wire each
 * one individually, this module installs ONE listener that, on the
 * first user gesture, walks every <video> on the page and calls
 * `.play()` on the muted ones. Subsequent mounts get caught too via a
 * MutationObserver — when a new <video> appears AFTER the gesture, we
 * try to play it immediately (the gesture activation persists for the
 * lifetime of the document).
 */

let unlocked = false;

function tryPlayAll(): void {
  const videos = document.querySelectorAll<HTMLVideoElement>("video");
  videos.forEach((v) => {
    // Only auto-play muted clips. Anything with sound is the user's
    // explicit responsibility — we don't want to surprise-blast audio.
    if (!v.muted) return;
    // Skip elements the user has explicitly paused (e.g. via controls).
    if (v.dataset.bootstrapHandled === "skip") return;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* still locked; will retry on next gesture */
      });
    }
  });
}

function unlock(): void {
  if (unlocked) return;
  unlocked = true;
  tryPlayAll();

  // Watch for late-mounted videos. React frequently re-mounts media
  // elements on route change / lazy-load, and they arrive with an
  // unfulfilled play() promise even though the document already has a
  // gesture activation. Re-trying on each insertion is cheap.
  if (typeof MutationObserver !== "undefined") {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of Array.from(r.addedNodes)) {
          if (node instanceof HTMLVideoElement) {
            if (node.muted) {
              const p = node.play();
              if (p && typeof p.catch === "function") {
                p.catch(() => {});
              }
            }
          } else if (node instanceof HTMLElement) {
            const nested = node.querySelectorAll?.("video");
            nested?.forEach((v) => {
              if (v.muted) {
                const p = v.play();
                if (p && typeof p.catch === "function") {
                  p.catch(() => {});
                }
              }
            });
          }
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
}

if (typeof window !== "undefined") {
  // EntryGate dispatches this synchronously inside its handleEnter,
  // which means we run inside the same user-gesture task as the
  // touch/click. That's the only signal Telegram WebView reliably
  // accepts as activation for media play(). Falling back to plain
  // click/keydown covers users who land deep-linked past the gate.
  document.addEventListener("itityl:enter", unlock);
  document.addEventListener("click", unlock);
  document.addEventListener("keydown", unlock);
}
