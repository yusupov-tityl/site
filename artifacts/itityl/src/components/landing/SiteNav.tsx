import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic } from "@/components/Magnetic";
import { useContactModal } from "@/lib/contact-modal";

const MENU = [
  { l: "Услуги", to: "/services" },
  { l: "Продукты", to: "/products" },
  { l: "Технологии", to: "/technologies" },
  { l: "Команда", to: "/#team", hash: true },
  { l: "Компания", to: "/#about", hash: true },
];

export function SiteNav() {
  const [loc] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useContactModal();

  useEffect(() => {
    setMobileOpen(false);
  }, [loc]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className="group fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5 hover:border-white/15 bg-black/30 backdrop-blur-[3px] hover:bg-black/70 hover:backdrop-blur-md transition-[background-color,backdrop-filter,border-color] duration-300">
        <Magnetic strength={0.25}>
          <Link
            href="/"
            data-cursor="link"
            aria-label="На главную"
            className="flex items-end gap-1"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="Ай-Титул"
              className="h-9 md:h-12 w-auto select-none"
              draggable={false}
            />
            <span className="logo-cursor" aria-hidden>|</span>
          </Link>
        </Magnetic>

        <div className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-bold tracking-[0.2em] uppercase">
          {MENU.map((it) => {
            const active = !it.hash && loc === it.to;
            return (
              <Link
                key={it.to}
                href={it.to}
                data-cursor="link"
                className={`relative group transition-colors ${
                  active ? "text-amber-300" : "hover:text-amber-300"
                }`}
              >
                {it.l}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-amber-300 transition-all duration-500 ease-out ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <Magnetic strength={0.4}>
          <button
            type="button"
            onClick={() => open("nav-cta")}
            data-cursor="link"
            data-analytics="cta:nav-cta"
            className="hidden md:flex items-center gap-2 bg-amber-400 text-black px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
          >
            Связаться <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </Magnetic>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Открыть меню"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          data-cursor="link"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-white hover:text-amber-300 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 z-[90] bg-[#0A0A0A] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span
                className="text-[11px] uppercase tracking-[0.3em] text-amber-300 font-bold"
                aria-hidden
              >
                Меню
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Закрыть меню"
                data-cursor="link"
                className="inline-flex items-center justify-center w-11 h-11 -mr-2 text-white hover:text-amber-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
              className="flex-1 overflow-y-auto px-6 py-8 flex flex-col"
            >
              {MENU.map((it) => (
                <motion.li
                  key={it.to}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="border-b border-white/10"
                >
                  <Link
                    href={it.to}
                    data-cursor="link"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-5 text-2xl font-heading font-extrabold uppercase tracking-tight text-white hover:text-amber-300 transition-colors"
                  >
                    {it.l}
                    <ArrowUpRight className="w-5 h-5 text-white/40" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-6 pb-8 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  open("mobile-nav-cta");
                }}
                data-cursor="link"
                data-analytics="cta:mobile-nav-cta"
                className="w-full inline-flex items-center justify-between gap-2 bg-amber-400 text-black px-5 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
              >
                Связаться <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
