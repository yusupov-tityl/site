import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "itityl-consent-v1";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored = false;
    try {
      stored = !!window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = false;
    }
    if (stored) return;
    const t = window.setTimeout(() => setVisible(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* no-op */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Уведомление об обработке персональных данных"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 md:bottom-6 z-[80] mx-auto max-w-[1100px] border border-white/15 bg-black/90 backdrop-blur-md text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 p-5 md:p-6">
            <div className="flex-1 text-sm leading-relaxed text-white/80">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-300">
                Персональные данные
              </p>
              Продолжая использовать сайт, вы соглашаетесь на обработку
              файлов cookie и пользовательских данных в соответствии с{" "}
              <a
                href="#privacy"
                data-cursor="link"
                className="underline decoration-amber-300/60 underline-offset-4 hover:text-amber-300 transition-colors"
              >
                Политикой конфиденциальности
              </a>{" "}
              и требованиями Федерального закона №152-ФЗ «О персональных
              данных».
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button
                type="button"
                onClick={accept}
                data-cursor="link"
                className="flex items-center gap-2 bg-amber-400 text-black px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
              >
                Принимаю
              </button>
              <button
                type="button"
                onClick={accept}
                aria-label="Закрыть"
                data-cursor="link"
                className="p-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
