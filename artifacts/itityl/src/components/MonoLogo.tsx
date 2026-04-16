import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  /**
   * "light" — DARK logo on LIGHT background (e.g. colored logo on white PNG).
   *           Dark pixels → opaque white. Near-white pixels → transparent.
   * "dark"  — LIGHT logo on DARK background (e.g. white logo on blue JPG).
   *           Light pixels → opaque white. Near-black pixels → transparent.
   */
  kind?: "light" | "dark";
  className?: string;
};

/**
 * Renders any logo bitmap as a uniform white silhouette on transparent bg.
 * Processes the image once on <canvas>, then swaps the src to the data URL.
 * Result: all logos look identical in brightness, regardless of source color.
 */
export function MonoLogo({ src, alt, kind = "light", className }: Props) {
  const [processed, setProcessed] = useState<string | null>(null);
  const cache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const key = `${src}::${kind}`;
    const cached = cache.current.get(key);
    if (cached) {
      setProcessed(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, w, h);
      } catch {
        // CORS / tainted canvas — fall back to raw image
        setProcessed(src);
        return;
      }
      const d = imageData.data;

      // Thresholds tuned for typical brand assets
      const LIGHT_CUT = 235; // near-white pixel → treat as background
      const DARK_CUT = 40; // near-black pixel → treat as background for dark-bg sources

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        let alpha = 0;
        if (kind === "light") {
          // Keep dark pixels, drop light bg
          if (lum < LIGHT_CUT) {
            // map luminance [0..LIGHT_CUT] → alpha [255..0]
            alpha = Math.round((1 - lum / LIGHT_CUT) * 255);
          }
        } else {
          // Keep light pixels, drop dark bg
          if (lum > DARK_CUT) {
            // map luminance [DARK_CUT..255] → alpha [0..255]
            alpha = Math.round(((lum - DARK_CUT) / (255 - DARK_CUT)) * 255);
          }
        }

        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
        d[i + 3] = alpha;
      }

      ctx.putImageData(imageData, 0, 0);
      const url = canvas.toDataURL("image/png");
      cache.current.set(key, url);
      if (!cancelled) setProcessed(url);
    };
    img.onerror = () => {
      if (!cancelled) setProcessed(src);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, kind]);

  return (
    <img
      src={processed ?? ""}
      alt={alt}
      draggable={false}
      loading="lazy"
      className={className}
      style={{ visibility: processed ? "visible" : "hidden" }}
    />
  );
}
