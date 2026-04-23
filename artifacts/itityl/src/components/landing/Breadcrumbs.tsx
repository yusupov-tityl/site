import { Link } from "wouter";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${origin}${c.href}` } : {}),
    })),
  };
  return (
    <nav
      aria-label="Хлебные крошки"
      className="px-6 md:px-10 pt-28 md:pt-32 pb-4"
    >
      <ol className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/50 font-bold">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-3">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  data-cursor="link"
                  className="hover:text-amber-300 transition-colors"
                >
                  {c.label}
                </Link>
              ) : (
                <span className={last ? "text-white/80" : ""}>{c.label}</span>
              )}
              {!last && <span className="text-white/25" aria-hidden>—</span>}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />
    </nav>
  );
}
