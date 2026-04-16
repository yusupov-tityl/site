import { useState } from "react";

export type MarqueeItem =
  | string
  | {
      src: string;
      alt: string;
      /**
       * "light" — source has DARK logo on LIGHT background (most common).
       *           We invert colors so dark becomes light on our dark page.
       * "dark"  — source has LIGHT logo on DARK/colored background.
       *           We just strip color with grayscale + screen blend.
       */
      kind?: "light" | "dark";
    };

type Props = {
  items: MarqueeItem[];
  reverse?: boolean;
  speed?: number;
};

export function MarqueeRow({ items, reverse = false, speed = 28 }: Props) {
  const [paused, setPaused] = useState(false);
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden flex"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex whitespace-nowrap will-change-transform items-center"
        style={{
          animation: `marquee-${reverse ? "rev" : "fwd"} ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((item, i) => {
          if (typeof item === "string") {
            return (
              <span
                key={i}
                data-cursor="link"
                className="mx-10 md:mx-14 text-xl md:text-2xl font-heading font-extrabold text-white/25 hover:text-white uppercase tracking-widest flex-shrink-0 transition-colors duration-300 inline-block hover:[transform:perspective(400px)_rotateX(8deg)]"
              >
                {item}
              </span>
            );
          }

          const kind = item.kind ?? "light";
          // For light-bg sources: invert colors -> dark logo becomes light on dark page.
          //   Crank contrast so pale logos (e.g. orange on white) become readable white.
          // For dark-bg sources: grayscale + screen blend mode erases colored bg
          const filterClass =
            kind === "light"
              ? "grayscale invert brightness-125 contrast-200"
              : "grayscale brightness-150 contrast-125";
          const blendClass = kind === "dark" ? "mix-blend-screen" : "";

          return (
            <span
              key={i}
              data-cursor="link"
              className="mx-8 md:mx-12 flex-shrink-0 inline-flex items-center"
            >
              <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                loading="lazy"
                className={`h-16 md:h-24 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 select-none ${filterClass} ${blendClass}`}
              />
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes marquee-fwd { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes marquee-rev { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}
