import { useState } from "react";

type Props = {
  items: string[];
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
        className="flex whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee-${reverse ? "rev" : "fwd"} ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            data-cursor="link"
            className="mx-10 md:mx-14 text-xl md:text-2xl font-heading font-extrabold text-white/25 hover:text-white uppercase tracking-widest flex-shrink-0 transition-colors duration-300 inline-block hover:[transform:perspective(400px)_rotateX(8deg)]"
          >
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-fwd { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes marquee-rev { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}
