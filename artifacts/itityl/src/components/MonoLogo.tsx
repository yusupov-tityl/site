import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  /**
   * "light" — DARK/colored logo on LIGHT background (most common).
   *           Anything visibly darker than white → opaque white.
   * "dark"  — LIGHT logo on DARK/colored background.
   *           Anything visibly lighter than black → opaque white.
   */
  kind?: "light" | "dark";
  className?: string;
};

const cache = new Map<string, string>();

/**
 * Renders any logo bitmap as a uniform white silhouette on transparent bg.
 * All processed logos end up at identical brightness regardless of source color.
 */
export function MonoLogo({ src, alt, kind = "light", className }: Props) {
  const [processed, setProcessed] = useState<string | null>(
    cache.get(`${src}::${kind}`) ?? null,
  );
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const key = `${src}::${kind}`;
    const cached = cache.get(key);
    if (cached) {
      setProcessed(cached);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!mounted.current) return;
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
        setProcessed(src);
        return;
      }
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const origAlpha = d[i + 3];

        let alpha = 0;

        if (kind === "light") {
          // How far is this pixel from pure white? Any channel being "dark"
          // means the pixel is part of the logo. Use max channel-wise delta
          // so a bright orange (255,165,0) reads as strong as dark blue.
          const delta = Math.max(255 - r, 255 - g, 255 - b);
          // Pixels within 20 of white → transparent (background).
          // Everything else → aggressively ramped to opaque.
          if (delta > 20) {
            alpha = Math.min(255, (delta - 20) * 4);
          }
        } else {
          // kind === "dark": keep bright pixels.
          const maxCh = Math.max(r, g, b);
          // Pixels darker than 40 → transparent (background).
          // Everything else → aggressively ramped to opaque.
          if (maxCh > 40) {
            alpha = Math.min(255, (maxCh - 40) * 4);
          }
        }

        // Respect original alpha (don't brighten transparent pixels)
        alpha = Math.round((alpha * origAlpha) / 255);

        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
        d[i + 3] = alpha;
      }

      ctx.putImageData(imageData, 0, 0);
      const url = canvas.toDataURL("image/png");
      cache.set(key, url);
      if (mounted.current) setProcessed(url);
    };
    img.onerror = () => {
      if (mounted.current) setProcessed(src);
    };
    img.src = src;

    return () => {
      mounted.current = false;
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
