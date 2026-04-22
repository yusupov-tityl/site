import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SplitText } from "@/components/SplitText";
import { Magnetic } from "@/components/Magnetic";
import { easeOutExpo } from "@/lib/motion";

type Props = {
  index: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctas: { label: string; href: string }[];
};

export function PageHero({ index, eyebrow, title, subtitle, ctas }: Props) {
  return (
    <section className="relative pt-32 md:pt-40 pb-24 px-6 md:px-10 min-h-[88vh] flex flex-col justify-center overflow-hidden border-b border-white/10">
      <HeroBackdrop />
      <div className="relative z-10 max-w-[1600px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.2 }}
          className="flex items-center gap-4 mb-8 text-[11px] uppercase tracking-[0.3em] text-white/50 font-bold"
        >
          <span className="text-amber-300">{index}</span>
          <span className="w-8 h-px bg-amber-300/60" />
          <span>{eyebrow}</span>
        </motion.div>
        <SplitText
          as="h1"
          text={title}
          stagger={0.04}
          className="font-heading font-extrabold uppercase tracking-tight leading-[0.95] text-5xl md:text-7xl lg:text-[88px] max-w-6xl"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.6 }}
          className="mt-10 max-w-3xl text-base md:text-xl text-white/70 leading-relaxed"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.8 }}
          className="mt-12 flex flex-wrap gap-3 items-center"
        >
          {ctas.map((c, i) => (
            <Magnetic key={c.label} strength={0.3}>
              <a
                href={c.href}
                data-cursor="link"
                className={`inline-flex items-center gap-2 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors ${
                  i === 0
                    ? "bg-amber-400 text-black hover:bg-amber-300"
                    : "border border-white/25 text-white/85 hover:border-amber-300 hover:text-amber-300"
                }`}
              >
                {c.label} <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </Magnetic>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          className="mt-20 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold"
        >
          <ArrowDown className="w-3.5 h-3.5" /> Прокрутите вниз
        </motion.div>
      </div>
    </section>
  );
}
