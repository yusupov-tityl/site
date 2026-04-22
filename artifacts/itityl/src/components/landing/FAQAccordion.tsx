import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export type FAQItem = { q: string; a: string };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="border-t border-white/15">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className="border-b border-white/15">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              data-cursor="link"
              className="w-full text-left py-7 md:py-8 flex items-start gap-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
            >
              <span className="text-[11px] text-amber-300 font-bold tracking-[0.3em] mt-1 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-lg md:text-2xl font-heading font-bold tracking-tight group-hover:text-amber-300 transition-colors">
                {it.q}
              </span>
              <span
                className={`shrink-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all duration-500 ${
                  isOpen
                    ? "bg-amber-300 border-amber-300 text-black rotate-45"
                    : "text-white/70 group-hover:border-amber-300/60 group-hover:text-amber-300"
                }`}
                aria-hidden
              >
                <Plus className="w-4 h-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-8 pl-12 md:pl-16 pr-12 md:pr-20 max-w-3xl text-base md:text-lg text-white/65 leading-relaxed">
                    {it.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
