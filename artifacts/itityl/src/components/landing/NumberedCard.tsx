import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { fadeUp, easeOutExpo } from "@/lib/motion";

type Props = {
  index: number;
  title: string;
  desc: string;
  to?: string;
  cta?: string;
};

export function NumberedCard({ index, title, desc, to, cta }: Props) {
  const num = String(index).padStart(2, "0");
  const inner = (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className="bg-[#141414] p-8 lg:p-12 flex flex-col gap-6 min-h-[320px] group relative overflow-hidden border border-transparent hover:border-amber-300/40 transition-colors duration-500 h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 group-hover:from-amber-500/10 transition-all duration-700" />
      <div
        className="pointer-events-none absolute -top-4 -right-2 text-[140px] md:text-[180px] leading-none font-heading font-extrabold text-white/[0.04] select-none"
        aria-hidden
      >
        {num}
      </div>
      <div className="relative flex items-start justify-between">
        <span className="text-[11px] text-amber-300 font-bold tracking-[0.3em]">{num}</span>
        {to && (
          <ArrowUpRight className="w-6 h-6 text-white/40 group-hover:text-amber-300 group-hover:rotate-12 transition-all duration-500" />
        )}
      </div>
      <div className="relative mt-auto">
        <h3 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-tight mb-4 group-hover:text-amber-300 transition-colors duration-500">
          {title}
        </h3>
        <p className="text-sm md:text-base text-white/55 leading-relaxed">{desc}</p>
        {cta && to && (
          <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/70 group-hover:text-amber-300 transition-colors">
            {cta} <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 h-px w-0 bg-amber-300 group-hover:w-full transition-all duration-700 ease-out" />
    </motion.div>
  );

  if (to) {
    return (
      <Link href={to} data-cursor="view" data-cursor-label="Открыть" className="block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full">{inner}</div>;
}
