import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function PillRow({ items }: { items: string[] }) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex flex-wrap gap-3"
    >
      {items.map((it) => (
        <motion.li
          key={it}
          variants={fadeUp}
          className="px-5 py-2.5 rounded-full border border-white/15 text-xs md:text-sm uppercase tracking-[0.18em] font-bold text-white/70 hover:text-amber-300 hover:border-amber-300/60 transition-colors duration-300 cursor-default"
        >
          {it}
        </motion.li>
      ))}
    </motion.ul>
  );
}
