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
      if (
        id !== "ld-org" &&
        id !== "ld-website" &&
        id !== "ld-localbusiness"
      ) {
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
 * LocalBusiness schema — gives Yandex the data it needs for the
 * Knowledge Panel / Yandex.Maps / Yandex.Бизнес matching. Mounted once
 * globally alongside Organization.
 */
export function LocalBusinessSchema() {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://itityl.ru/#localbusiness",
    name: "Ай-Титул",
    legalName: "ООО «АЙ-ТИТУЛ»",
    url: "https://itityl.ru",
    image: "https://itityl.ru/opengraph.jpg",
    logo: "https://itityl.ru/logo.svg",
    telephone: "+7-993-338-43-13",
    email: "pochta@i-tityl.ru",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "пр-кт Андропова, д. 18, к. 1, помещ. 8/8",
      addressLocality: "Москва",
      postalCode: "115432",
      addressCountry: "RU",
    },
    areaServed: { "@type": "Country", name: "Россия" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    taxID: "9725182971",
  };
  return <StructuredDataNode id="ld-localbusiness" data={data} />;
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

/**
 * FAQ rich-result schema. Pass the same items you give to FAQAccordion.
 * Yandex and Google can render expandable Q&A directly in SERP.
 */
export function FAQPageSchema({
  items,
}: {
  items: Array<{ q: string; a: string }>;
}) {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return <StructuredDataNode id="ld-faq" data={data} />;
}

/**
 * ItemList schema for catalog-style pages (services hub, products hub).
 * Helps search engines understand the page is a list of offerings and
 * occasionally enables sitelinks-like rich treatment.
 */
export function ItemListSchema({
  id = "ld-itemlist",
  name,
  items,
}: {
  id?: string;
  name: string;
  items: Array<{ name: string; url: string; description?: string }>;
}) {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url.startsWith("http") ? it.url : `https://itityl.ru${it.url}`,
      ...(it.description ? { description: it.description } : {}),
    })),
  };
  return <StructuredDataNode id={id} data={data} />;
}

/**
 * Article schema — for case studies, blog posts, press releases.
 * Pass datePublished as ISO 8601 ("2025-03-14"). Ай-Титул is the
 * default publisher; override only if reposting.
 */
export function ArticleSchema({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
}: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: url.startsWith("http") ? url : `https://itityl.ru${url}`,
    ...(image
      ? {
          image: image.startsWith("http") ? image : `https://itityl.ru${image}`,
        }
      : {}),
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Organization",
      name: author ?? "Ай-Титул",
      url: "https://itityl.ru",
    },
    publisher: {
      "@type": "Organization",
      name: "Ай-Титул",
      logo: {
        "@type": "ImageObject",
        url: "https://itityl.ru/logo.svg",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "ru-RU",
  };
  return <StructuredDataNode id="ld-article" data={data} />;
}

/**
 * Service schema for individual service / product detail pages.
 * Communicates "we offer this service, here's the provider, area, type".
 */
export function ServiceSchema({
  name,
  description,
  url,
  serviceType,
}: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: url.startsWith("http") ? url : `https://itityl.ru${url}`,
    ...(serviceType ? { serviceType } : {}),
    provider: {
      "@type": "Organization",
      name: "Ай-Титул",
      url: "https://itityl.ru",
    },
    areaServed: { "@type": "Country", name: "Россия" },
    inLanguage: "ru-RU",
  };
  return <StructuredDataNode id="ld-service" data={data} />;
}
