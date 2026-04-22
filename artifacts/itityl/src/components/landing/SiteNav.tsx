import { Link, useLocation } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";

const MENU = [
  { l: "Услуги", to: "/services" },
  { l: "Продукты", to: "/products" },
  { l: "Технологии", to: "/technologies" },
  { l: "Команда", to: "/#team", hash: true },
  { l: "Компания", to: "/#about", hash: true },
];

export function SiteNav() {
  const [loc] = useLocation();
  return (
    <nav className="group fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5 hover:border-white/15 bg-black/30 backdrop-blur-[3px] hover:bg-black/70 hover:backdrop-blur-md transition-[background-color,backdrop-filter,border-color] duration-300">
      <Magnetic strength={0.25}>
        <Link href="/" data-cursor="link" className="flex items-end gap-1">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Ай-Титул"
            className="h-10 md:h-12 w-auto select-none"
            draggable={false}
          />
          <span className="logo-cursor" aria-hidden>|</span>
        </Link>
      </Magnetic>

      <div className="hidden md:flex items-center gap-10 text-xs font-bold tracking-[0.2em] uppercase">
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
        <Link
          href="/#contact"
          data-cursor="link"
          className="hidden md:flex items-center gap-2 bg-amber-400 text-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 hover:text-black transition-colors"
        >
          Связаться <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </Magnetic>
    </nav>
  );
}
