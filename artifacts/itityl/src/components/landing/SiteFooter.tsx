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
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-8 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
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

        {/* Реквизиты компании — требование 152-ФЗ и госзакупок. */}
        <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-1.5 text-[11px] leading-relaxed text-white/35 text-center">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>ООО «АЙ-ТИТУЛ»</span>
            <span className="text-white/20">·</span>
            <span>ИНН 9725182971</span>
            <span className="text-white/20">·</span>
            <span>КПП 772501001</span>
            <span className="text-white/20">·</span>
            <span>ОГРН 1257700145504</span>
          </p>
          <p>115432, г. Москва, пр-кт Андропова, д. 18, к. 1, помещ. 8/8</p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <a
              href="mailto:pochta@i-tityl.ru"
              data-cursor="link"
              className="hover:text-amber-300 transition-colors"
            >
              pochta@i-tityl.ru
            </a>
            <span className="text-white/20">·</span>
            <a
              href="tel:+79933384313"
              data-cursor="link"
              className="hover:text-amber-300 transition-colors"
            >
              +7 (993) 338-43-13
            </a>
          </p>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
          &copy; {new Date().getFullYear()} АЙ-ТИТУЛ. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
