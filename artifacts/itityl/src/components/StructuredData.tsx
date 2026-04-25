import { useEffect } from "react";

/**
 * Schema.org JSON-LD blocks for the site.
 *
 * Search engines use these to render rich results (Knowledge Panel,
 * sitelinks search box, breadcrumb trails) and to build out their
 * understanding of who Ай-Титул is. We inject them on the client so
 * the markup lives next to the rest of the SPA — Yandex and Google
 * both run JS on indexing, so SSR isn't required for these to count.
 *
 * The Organization block is mounted globally from App.tsx; per-page
 * BreadcrumbList blocks live in their respective pages.
 */

type JsonLd = Record<string, unknown>;

function StructuredDataNode({ id, data }: { id: string; data: JsonLd }) {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.text = JSON.stringify(data);
    return () => {
      // Don't remove globally-managed nodes on every re-render — only
      // remove the temporary per-route ones (they re-create on next page).
      if (id !== "ld-org" && id !== "ld-website") {
        el?.remove();
      }
    };
  }, [id, data]);
  return null;
}

/**
 * Site-wide Organization schema. Mounted once in App.
 * Updates here propagate to every page.
 */
export function OrganizationSchema() {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ай-Титул",
    legalName: "ООО «АЙ-ТИТУЛ»",
    url: "https://itityl.ru",
    logo: "https://itityl.ru/logo.svg",
    description:
      "Прикладные ИИ-решения для бизнеса и государственного сектора: обследование процессов, пилоты, разработка и внедрение LLM/RAG/ИИ-агентов.",
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      streetAddress: "пр-кт Андропова, д. 18, к. 1, помещ. 8/8",
      addressLocality: "Москва",
      postalCode: "115432",
      addressCountry: "RU",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+7-993-338-43-13",
        contactType: "sales",
        email: "pochta@i-tityl.ru",
        availableLanguage: ["ru"],
      },
    ],
    sameAs: [],
    taxID: "9725182971",
  };
  return <StructuredDataNode id="ld-org" data={data} />;
}

/**
 * Site-wide WebSite schema with sitelinks search action — gives Yandex /
 * Google the "search inside the site" affordance in SERP.
 */
export function WebSiteSchema() {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ай-Титул",
    url: "https://itityl.ru",
    inLanguage: "ru-RU",
  };
  return <StructuredDataNode id="ld-website" data={data} />;
}

/**
 * Per-page breadcrumb trail. Pass items in order from root to current.
 * Example:
 *   <BreadcrumbSchema items={[
 *     { name: "Главная", url: "/" },
 *     { name: "Услуги", url: "/services" },
 *   ]} />
 */
export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `https://itityl.ru${item.url}`,
    })),
  };
  return <StructuredDataNode id="ld-breadcrumb" data={data} />;
}
