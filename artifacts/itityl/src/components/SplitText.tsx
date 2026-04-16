import { motion, type Variants } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

type SplitTag = "h1" | "h2" | "h3" | "p" | "span" | "div";

type Props = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  as?: SplitTag;
  once?: boolean;
};

const lineVariants: Variants = {
  hidden: {},
  visible: (s: number) => ({
    transition: { staggerChildren: s },
  }),
};

const wordVariants: Variants = {
  hidden: { y: "115%" },
  visible: {
    y: "0%",
    transition: { duration: 0.95, ease: easeOutExpo },
  },
};

export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.08,
  as = "h2",
  once = true,
}: Props) {
  const words = text.split(" ");

  const Wrapper = motion[as];

  return (
    <Wrapper
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10%" }}
      variants={lineVariants}
      custom={stagger}
      transition={{ delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
        >
          <motion.span
            variants={wordVariants}
            className={`inline-block will-change-transform ${wordClassName ?? ""}`}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
}
