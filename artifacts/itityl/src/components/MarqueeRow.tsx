import { useEffect, useRef, useState } from "react";
import { MonoLogo } from "./MonoLogo";

export type MarqueeItem =
  | string
  | {
      src: string;
      alt: string;
      kind?: "light" | "dark";
      size?: "md" | "lg" | "xl";
    };

type Props = {
  items: MarqueeItem[];
  reverse?: boolean;
  /** seconds for one items-width to scroll by */
  speed?: number;
};

export function MarqueeRow({ items, reverse = false, speed = 28 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [copyWidth, setCopyWidth] = useState(0);

  // Measure container + one-copy width on mount and on resize
  useEffect(() => {
    const c = containerRef.current;
    const f = firstCopyRef.current;
    if (!c || !f) return;
    const measure = () => {
      setContainerWidth(c.clientWidth);
      setCopyWidth(f.scrollWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    ro.observe(f);
    // images may load async → remeasure when their sizes are known
    const imgs = f.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });
    return () => ro.disconnect();
  }, [items]);

  // How many copies do we need so that, while translating by one copy width,
  // the viewport is always fully covered?
  //   N * copyWidth >= containerWidth + copyWidth  →  N >= container/copy + 1
  // Default to 3 until measurements land.
  const copies =
    copyWidth > 0 && containerWidth > 0
      ? Math.max(2, Math.ceil(containerWidth / copyWidth) + 1)
      : 3;

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
    const sizeClass =
      size === "xl"
        ? "h-16 md:h-24"
        : size === "lg"
          ? "h-14 md:h-20"
          : "h-10 md:h-14";
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
          className={`${sizeClass} w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 select-none`}
        />
      </span>
    );
  };

  const keyframeName = reverse ? "marquee-rev" : "marquee-fwd";
  const ready = copyWidth > 0;

  return (
    <div
      ref={containerRef}
      className="overflow-hidden flex relative"
      style={{ ["--copy-width" as string]: `${copyWidth}px` }}
    >
      <div
        className="flex whitespace-nowrap will-change-transform items-center"
        style={{
          animation: ready ? `${keyframeName} ${speed}s linear infinite` : "none",
        }}
      >
        {/* First (measured) copy */}
        <div ref={firstCopyRef} className="flex items-center flex-shrink-0">
          {items.map((item, i) => renderItem(item, "m0", i))}
        </div>
        {/* Additional identical copies — enough to keep viewport filled during
            the full -copyWidth translation cycle. */}
        {Array.from({ length: copies - 1 }).map((_, c) => (
          <div
            key={`copy-${c}`}
            className="flex items-center flex-shrink-0"
            aria-hidden
          >
            {items.map((item, i) => renderItem(item, `c${c}`, i))}
          </div>
        ))}
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
