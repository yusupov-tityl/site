import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fadeUp, lineDraw } from "@/lib/motion";

const ContactForm = lazy(() =>
  import("@/components/ContactForm").then((m) => ({ default: m.ContactForm })),
);

type Props = {
  index?: string;
  title: string;
  body?: string;
  buttons?: { label: string; href?: string }[];
};

export function CTASection({ index = "—", title, body, buttons = [] }: Props) {
  return (
    <section
      id="contact"
      className="py-28 md:py-32 px-6 md:px-10 bg-amber-400 text-black border-t border-black/10"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="max-w-[1600px] mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-4 mb-8 text-[11px] uppercase tracking-[0.3em] text-black/60 font-bold"
        >
          <span>{index}</span>
          <span className="w-8 h-px bg-black/40" />
          <span>Контакт</span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-heading font-extrabold uppercase tracking-tight leading-[1.05] text-4xl md:text-5xl lg:text-6xl max-w-4xl"
        >
          {title}
        </motion.h2>
        {body && (
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-3xl text-base md:text-lg text-black/70 leading-relaxed"
          >
            {body}
          </motion.p>
        )}
        {buttons.length > 0 && (
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
            {buttons.map((b) => (
              <a
                key={b.label}
                href={b.href ?? "#contact"}
                data-cursor="link"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
              >
                {b.label} <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ))}
          </motion.div>
        )}

        <motion.div variants={lineDraw} className="h-px bg-black/20 origin-left my-14" />

        <Suspense fallback={<div className="h-96" aria-hidden />}>
          <ContactForm />
        </Suspense>
      </motion.div>
    </section>
  );
}
