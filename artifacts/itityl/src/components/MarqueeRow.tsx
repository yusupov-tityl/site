import { useEffect, useRef, useState } from "react";
import { MonoLogo } from "./MonoLogo";

export type MarqueeItem =
  | string
  | {
      src: string;
      alt: string;
      kind?: "light" | "dark";
      size?: "md" | "lg";
    };

type Props = {
  items: MarqueeItem[];
  reverse?: boolean;
  /** duration in seconds for one full cycle */
  speed?: number;
};

export function MarqueeRow({ items, reverse = false, speed = 28 }: Props) {
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);

  // Measure the width of ONE copy of items, so we can translate by exactly
  // that many px at the end of the animation — no % math, no rounding drift.
  useEffect(() => {
    const el = firstCopyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setCopyWidth(el.scrollWidth);
    });
    ro.observe(el);
    setCopyWidth(el.scrollWidth);
    return () => ro.disconnect();
  }, [items]);

  const renderItem = (item: MarqueeItem, keyPrefix: string, idx: number) => {
    if (typeof item === "string") {
      return (
        <span
          key={`${keyPrefix}-${idx}`}
          data-cursor="link"
          className="mx-10 md:mx-14 text-xl md:text-2xl font-heading font-extrabold text-white/25 hover:text-white uppercase tracking-widest flex-shrink-0 transition-colors duration-300 inline-block"
        >
          {item}
        </span>
      );
    }
    const size = item.size ?? "md";
    const sizeClass = size === "lg" ? "h-14 md:h-20" : "h-10 md:h-14";
    return (
      <span
        key={`${keyPrefix}-${idx}`}
        data-cursor="link"
        className="mx-8 md:mx-12 flex-shrink-0 inline-flex items-center"
      >
        <MonoLogo
          src={item.src}
          alt={item.alt}
          kind={item.kind ?? "light"}
          className={`${sizeClass} w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 select-none`}
        />
      </span>
    );
  };

  // We render TWO identical copies of items. The animation translates the
  // whole track left by exactly ONE copy width. When it snaps back to 0, the
  // viewport has identical content (copy 2 looks like copy 1), so zero jump.
  const keyframeName = reverse ? "marquee-rev" : "marquee-fwd";

  return (
    <div
      className="overflow-hidden flex relative"
      style={{
        ["--copy-width" as string]: `${copyWidth}px`,
      }}
    >
      <div
        className="flex whitespace-nowrap will-change-transform items-center"
        style={{
          animation: copyWidth > 0 ? `${keyframeName} ${speed}s linear infinite` : "none",
        }}
      >
        <div ref={firstCopyRef} className="flex items-center flex-shrink-0">
          {items.map((item, i) => renderItem(item, "a", i))}
        </div>
        <div className="flex items-center flex-shrink-0" aria-hidden>
          {items.map((item, i) => renderItem(item, "b", i))}
        </div>
      </div>
      <style>{`
        @keyframes marquee-fwd {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-1 * var(--copy-width)), 0, 0); }
        }
        @keyframes marquee-rev {
          from { transform: translate3d(calc(-1 * var(--copy-width)), 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </div>
  );
}
