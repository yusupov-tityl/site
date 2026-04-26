import { m as motion } from "framer-motion";
import { fadeUp, lineDraw } from "@/lib/motion";

type Props = {
  index?: string;
  label?: string;
  title: string;
  body?: string | string[];
  align?: "left" | "split";
  className?: string;
};

export function SectionHeader({
  index,
  label,
  title,
  body,
  align = "split",
  className = "",
}: Props) {
  const paragraphs = Array.isArray(body) ? body : body ? [body] : [];
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      className={`max-w-[1600px] mx-auto ${className}`}
    >
      {(index || label) && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-4 mb-8 text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold"
        >
          {index && <span className="text-amber-300">{index}</span>}
          {label && (
            <>
              <span className="w-8 h-px bg-amber-300/60" />
              <span>{label}</span>
            </>
          )}
        </motion.div>
      )}
      <div
        className={
          align === "split"
            ? "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end"
            : ""
        }
      >
        <motion.h2
          variants={fadeUp}
          className={`font-heading font-extrabold uppercase tracking-tight leading-[1.05] text-4xl md:text-5xl lg:text-6xl ${
            align === "split" ? "lg:col-span-7" : "max-w-5xl"
          }`}
        >
          {title}
        </motion.h2>
        {paragraphs.length > 0 && (
          <motion.div
            variants={fadeUp}
            className={`flex flex-col gap-5 text-base md:text-lg text-white/65 leading-relaxed ${
              align === "split" ? "lg:col-span-5" : "max-w-3xl mt-6"
            }`}
          >
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>
        )}
      </div>
      <motion.div
        variants={lineDraw}
        className="h-px bg-white/15 origin-left mt-12"
      />
    </motion.div>
  );
}
