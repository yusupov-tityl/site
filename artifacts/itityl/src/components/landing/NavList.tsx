import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { fadeUp } from "@/lib/motion";

export function NavList({ items }: { items: { label: string; to: string }[] }) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      className="border-t border-white/15"
    >
      {items.map((it) => (
        <motion.li key={it.to} variants={fadeUp} className="border-b border-white/15">
          <Link
            href={it.to}
            data-cursor="view"
            data-cursor-label="Открыть"
            className="group flex items-center justify-between gap-6 py-7 md:py-8 hover:bg-white/[0.03] transition-colors px-2"
          >
            <span className="text-2xl md:text-4xl font-heading font-extrabold uppercase tracking-tight group-hover:text-amber-300 transition-colors">
              {it.label}
            </span>
            <ArrowUpRight className="w-7 h-7 text-white/40 group-hover:text-amber-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
