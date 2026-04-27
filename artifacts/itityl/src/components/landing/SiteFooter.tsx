import { Link } from "wouter";

export function SiteFooter() {
  const links: Array<{ l: string; to: string; external?: boolean }> = [
    { l: "Продукты", to: "/products" },
    { l: "Технологии", to: "/technologies" },
    { l: "Услуги", to: "/services" },
    { l: "Конфиденциальность", to: "/privacy" },
    { l: "Карта сайта", to: "/sitemap.html", external: true },
  ];
  return (
    <footer className="py-10 px-6 md:px-10 bg-black text-white border-t border-white/15">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
        <p>&copy; {new Date().getFullYear()} АЙ-ТИТУЛ. Все права защищены.</p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {links.map((l, i) =>
            l.external ? (
              <a
                key={`${l.to}-${i}`}
                href={l.to}
                data-cursor="link"
                className="hover:text-amber-300 transition-colors"
              >
                {l.l}
              </a>
            ) : (
              <Link
                key={`${l.to}-${i}`}
                href={l.to}
                data-cursor="link"
                className="hover:text-amber-300 transition-colors"
              >
                {l.l}
              </Link>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
