import { m as motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SplitText } from "@/components/SplitText";
import { Magnetic } from "@/components/Magnetic";
import { easeOutExpo } from "@/lib/motion";
import { useContactModal } from "@/lib/contact-modal";

type CTA =
  | { label: string; href: string }
  | { label: string; ctaSource: string };

type Props = {
  index: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctas: CTA[];
  hasBreadcrumbs?: boolean;
};

export function PageHero({ index, eyebrow, title, subtitle, ctas, hasBreadcrumbs }: Props) {
  const { open } = useContactModal();
  return (
    <section
      className={`relative ${hasBreadcrumbs ? "pt-6 md:pt-10" : "pt-32 md:pt-40"} pb-20 md:pb-24 px-6 md:px-10 min-h-[80vh] flex flex-col justify-center overflow-hidden border-b border-white/10`}
    >
      <HeroBackdrop />
      <div className="relative z-10 max-w-[1600px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.2 }}
          className="flex items-center gap-4 mb-6 md:mb-8 text-[11px] uppercase tracking-[0.3em] text-white/50 font-bold"
        >
          <span className="text-amber-300">{index}</span>
          <span className="w-8 h-px bg-amber-300/60" />
          <span>{eyebrow}</span>
        </motion.div>
        <SplitText
          as="h1"
          text={title}
          stagger={0.04}
          className="font-heading font-extrabold uppercase tracking-tight leading-[0.98] max-w-6xl text-[clamp(2.25rem,6.5vw,5rem)]"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.6 }}
          className="mt-8 md:mt-10 max-w-3xl text-base md:text-lg lg:text-xl text-white/70 leading-relaxed"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.8 }}
          className="mt-10 md:mt-12 flex flex-wrap gap-3 items-center"
        >
          {ctas.map((c, i) => {
            const isPrimary = i === 0;
            const cls = `inline-flex items-center gap-2 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors ${
              isPrimary
                ? "bg-amber-400 text-black hover:bg-amber-300"
                : "border border-white/25 text-white hover:border-amber-300 hover:text-amber-300"
            }`;
            const isModal = "ctaSource" in c;
            return (
              <Magnetic key={c.label} strength={0.3}>
                {isModal ? (
                  <button
                    type="button"
                    onClick={() => open(c.ctaSource)}
                    data-cursor="link"
                    data-analytics={`cta:${c.ctaSource}`}
                    className={cls}
                  >
                    {c.label} <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <a href={c.href} data-cursor="link" className={cls}>
                    {c.label} <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </Magnetic>
            );
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          className="mt-16 md:mt-20 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold"
        >
          <ArrowDown className="w-3.5 h-3.5" /> Прокрутите вниз
        </motion.div>
      </div>
    </section>
  );
}
