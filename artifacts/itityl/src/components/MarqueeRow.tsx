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
       *           We strip color with grayscale + screen blend.
       */
      kind?: "light" | "dark";
      /** Optional height override: "lg" bumps the logo ~30% larger */
      size?: "md" | "lg";
    };

type Props = {
  items: MarqueeItem[];
  reverse?: boolean;
  speed?: number;
};

export function MarqueeRow({ items, reverse = false, speed = 28 }: Props) {
  const [paused, setPaused] = useState(false);
  // Triple the list so the loop is seamless — when the first copy scrolls out,
  // the second copy occupies the same position, giving a continuous feed.
  const looped = [...items, ...items, ...items];

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
        {looped.map((item, i) => {
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
          const size = item.size ?? "md";
          // For light-bg sources: invert colors -> dark logo becomes light on dark page.
          //   Crank contrast so pale logos (e.g. orange on white) become readable white.
          // For dark-bg sources: grayscale + screen blend mode erases colored bg
          const filterClass =
            kind === "light"
              ? "grayscale invert brightness-150 contrast-[3]"
              : "grayscale brightness-150 contrast-125";
          const blendClass = kind === "dark" ? "mix-blend-screen" : "";
          const sizeClass =
            size === "lg" ? "h-14 md:h-20" : "h-10 md:h-14";

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
                className={`${sizeClass} w-auto object-contain opacity-55 hover:opacity-100 transition-opacity duration-300 select-none ${filterClass} ${blendClass}`}
              />
            </span>
          );
        })}
      </div>
      <style>{`
        /* Translate by exactly -1/3 (or +1/3 in reverse) — since the content is
           tripled, moving by 1/3 aligns perfectly with the start of the next copy,
           so the loop is seamless with no visible jump. */
        @keyframes marquee-fwd { from { transform: translate3d(0,0,0) } to { transform: translate3d(-33.3333%,0,0) } }
        @keyframes marquee-rev { from { transform: translate3d(-33.3333%,0,0) } to { transform: translate3d(0,0,0) } }
      `}</style>
    </div>
  );
}
