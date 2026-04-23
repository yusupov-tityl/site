import { Suspense, lazy, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useContactModal } from "@/lib/contact-modal";

const ContactForm = lazy(() =>
  import("@/components/ContactForm").then((m) => ({ default: m.ContactForm })),
);

export function ContactModal() {
  const { isOpen, source, close } = useContactModal();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="contact-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-start md:items-center justify-center px-3 md:px-6 py-6 md:py-12 bg-black/70 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[640px] bg-amber-400 text-black p-6 md:p-10 shadow-2xl"
            data-source={source ?? undefined}
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={close}
              aria-label="Закрыть"
              data-cursor="link"
              className="absolute top-3 right-3 md:top-5 md:right-5 w-10 h-10 flex items-center justify-center text-black/70 hover:text-black hover:bg-black/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-5 md:mb-7">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/60">
                Связаться
              </div>
              <h2
                id="contact-modal-title"
                className="mt-3 font-heading font-extrabold uppercase tracking-tight leading-[1.05] text-2xl md:text-4xl"
              >
                Расскажите о задаче
              </h2>
              <p className="mt-3 text-sm md:text-base text-black/70 max-w-md leading-relaxed">
                Опишите контекст — мы свяжемся с вами в течение рабочего дня.
              </p>
            </div>
            <Suspense fallback={<div className="h-72" aria-hidden />}>
              <ContactForm source={source ?? undefined} />
            </Suspense>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
