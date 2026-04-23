import { ArrowUpRight } from "lucide-react";
import { useContactModal } from "@/lib/contact-modal";

type Variant = "primary" | "outline" | "dark";

type Props = {
  label: string;
  ctaSource: string;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
};

const styles: Record<Variant, string> = {
  primary: "bg-amber-400 text-black hover:bg-amber-300",
  outline:
    "border border-white/25 text-white hover:border-amber-300 hover:text-amber-300",
  dark: "bg-black text-white hover:bg-white hover:text-black",
};

export function CTAButton({
  label,
  ctaSource,
  variant = "primary",
  size = "md",
  className = "",
}: Props) {
  const { open } = useContactModal();
  const padding = size === "lg" ? "px-8 py-4" : "px-6 py-3.5";
  return (
    <button
      type="button"
      onClick={() => open(ctaSource)}
      data-cursor="link"
      data-analytics={`cta:${ctaSource}`}
      data-cta-source={ctaSource}
      className={`inline-flex items-center gap-2 ${padding} text-xs font-extrabold uppercase tracking-widest transition-colors ${styles[variant]} ${className}`}
    >
      {label} <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  );
}
