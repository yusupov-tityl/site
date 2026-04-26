import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { m as motion } from "framer-motion";
import { useSeo } from "@/lib/useSeo";
import { SiteNav } from "@/components/landing/SiteNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Breadcrumbs } from "@/components/landing/Breadcrumbs";
import { CTAButton } from "@/components/landing/CTAButton";
import { easeOutExpo } from "@/lib/motion";

type Props = {
  title: string;
  parentLabel: string;
  parentTo: string;
};

export function ComingSoon({ title, parentLabel, parentTo }: Props) {
  useSeo({
    title: `${title} — Ай-Титул`,
    description: `${title}. Раздел в работе.`,
    noindex: true,
  });
  const slug = title.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").slice(0, 40);
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-amber-400 selection:text-black flex flex-col">
      <SiteNav />
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: parentLabel, href: parentTo },
          { label: title },
        ]}
      />
      <main className="flex-1 flex items-center px-6 md:px-10 pt-2 pb-20 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
          className="max-w-[1600px] mx-auto w-full"
        >
          <div className="flex items-center gap-3 mb-8 text-[11px] uppercase tracking-[0.3em] text-amber-300 font-bold">
            <span className="w-8 h-px bg-amber-300" />
            Скоро
          </div>
          <h1 className="font-heading font-extrabold uppercase tracking-tight leading-[0.98] max-w-5xl text-[clamp(2rem,5.5vw,4.5rem)]">
            {title}
          </h1>
          <p className="mt-8 text-base md:text-lg lg:text-xl text-white/60 max-w-2xl leading-relaxed">
            Этот раздел в работе. Мы готовим подробное описание, кейсы, технологические детали и сценарии применения. Если у вас уже есть задача — расскажите о ней, и мы поможем подобрать подходящий формат сотрудничества.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href={parentTo}
              data-cursor="link"
              className="inline-flex items-center gap-2 border border-white/25 text-white hover:border-amber-300 hover:text-amber-300 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Вернуться: {parentLabel}
            </Link>
            <CTAButton
              label="Связаться с командой"
              ctaSource={`coming-soon-${slug}`}
              variant="primary"
            />
          </div>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}
