#!/usr/bin/env node
/**
 * Post-build static prerender — lightweight, no Puppeteer.
 *
 * The SPA injects correct <title>, <meta description>, canonical and
 * JSON-LD via React. That's fine for users and modern crawlers, but a
 * bot that doesn't execute JS (or crawls before JS finishes) still
 * sees the generic root `index.html` for every URL. This hurts CTR
 * because Yandex/Google often pull the snippet from the *raw* HTML.
 *
 * Fix: take dist/public/index.html as a template and write a tailored
 * copy at dist/public/<route>/index.html with route-specific meta and
 * JSON-LD baked in. Apache's rewrite will serve the per-route file
 * directly (it exists), so the first byte already has correct SEO data.
 *
 * The React app still hydrates the same way once loaded — the <head>
 * gets re-asserted by useSeo on mount, but bots already have what they
 * need.
 *
 * Run after `vite build`. Reads from / writes to dist/public/.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist", "public");
const TEMPLATE_PATH = path.join(DIST, "index.html");

if (!existsSync(TEMPLATE_PATH)) {
  console.error(
    `[prerender] dist not found at ${TEMPLATE_PATH}. Run 'vite build' first.`,
  );
  process.exit(1);
}

const template = readFileSync(TEMPLATE_PATH, "utf8");

const SITE = "https://itityl.ru";

/**
 * @typedef {{
 *   route: string;
 *   title: string;
 *   description: string;
 *   breadcrumb?: Array<{ name: string; url: string }>;
 *   faq?: Array<{ q: string; a: string }>;
 *   itemList?: { name: string; items: Array<{ name: string; url: string; description?: string }> };
 * }} RouteSeo
 */

/** @type {RouteSeo[]} */
const routes = [
  {
    route: "/",
    title:
      "Ай-Титул — внедрение ИИ для бизнеса и госсектора | LLM, RAG, ИИ-агенты",
    description:
      "Внедряем ИИ под ваши процессы: обследование, пилоты, разработка, интеграция. LLM, RAG, ИИ-агенты, Document AI, компьютерное зрение. Кейсы и пилот за 4–8 недель.",
  },
  {
    route: "/services",
    title:
      "Услуги по внедрению ИИ — обследование, пилоты, разработка | Ай-Титул",
    description:
      "Полный цикл внедрения ИИ: AI-консалтинг, обследование процессов, портфель инициатив, пилоты за 4–8 недель, разработка и интеграция в корпоративный контур.",
    breadcrumb: [
      { name: "Главная", url: "/" },
      { name: "Услуги", url: "/services" },
    ],
  },
  {
    route: "/products",
    title:
      "Продукты Ай-Титул — ИИ-агенты, RAG, интеллектуальная канцелярия",
    description:
      "Готовые ИИ-решения для документов и знаний: ИИ-агенты, интеллектуальная канцелярия, аналитик документов, RAG по внутренним материалам. Внедрение в контуре заказчика.",
    breadcrumb: [
      { name: "Главная", url: "/" },
      { name: "Продукты", url: "/products" },
    ],
  },
  {
    route: "/technologies",
    title:
      "Технологии ИИ — LLM, RAG, Document AI, компьютерное зрение | Ай-Титул",
    description:
      "Прикладной стек ИИ для корпоративных задач: LLM и российские модели, RAG по документам, Document AI, видеоаналитика, ML. Подбираем технологию под процесс и контур.",
    breadcrumb: [
      { name: "Главная", url: "/" },
      { name: "Технологии", url: "/technologies" },
    ],
  },
  {
    route: "/privacy",
    title: "Политика конфиденциальности — Ай-Титул",
    description:
      "Политика обработки персональных данных Ай-Титул: цели обработки, состав данных, права субъекта, контакты ответственного лица.",
    breadcrumb: [
      { name: "Главная", url: "/" },
      { name: "Политика конфиденциальности", url: "/privacy" },
    ],
  },
];

function abs(url) {
  return url.startsWith("http") ? url : `${SITE}${url}`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ldJson(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(
    /</g,
    "\\u003c",
  )}</script>`;
}

function renderHead(seo) {
  const url = abs(seo.route);
  const desc = escapeHtml(seo.description);
  const title = escapeHtml(seo.title);

  const blocks = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:image" content="${SITE}/opengraph.jpg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${SITE}/opengraph.jpg" />`,
  ];

  if (seo.breadcrumb) {
    blocks.push(
      ldJson({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: seo.breadcrumb.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: abs(it.url),
        })),
      }),
    );
  }

  if (seo.faq) {
    blocks.push(
      ldJson({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seo.faq.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }),
    );
  }

  if (seo.itemList) {
    blocks.push(
      ldJson({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: seo.itemList.name,
        itemListElement: seo.itemList.items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: abs(it.url),
          ...(it.description ? { description: it.description } : {}),
        })),
      }),
    );
  }

  return blocks.join("\n    ");
}

/**
 * Replaces the default <title> + meta description in the template
 * (the ones baked into index.html for the home route) with route-
 * specific values, and injects extra <head> blocks before </head>.
 */
function buildHtmlForRoute(seo) {
  let html = template;

  // Strip the default title and description so we don't end up with
  // duplicates after injecting our own.
  html = html.replace(/<title>[^<]*<\/title>/i, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/i, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, "");
  // Remove existing OG/Twitter tags from the template — we re-emit
  // route-specific versions below.
  html = html.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, "");
  html = html.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, "");

  const head = renderHead(seo);
  html = html.replace(/<\/head>/i, `    ${head}\n  </head>`);
  return html;
}

let written = 0;
for (const seo of routes) {
  const html = buildHtmlForRoute(seo);
  const targetDir =
    seo.route === "/" ? DIST : path.join(DIST, seo.route.replace(/^\//, ""));
  if (seo.route !== "/") mkdirSync(targetDir, { recursive: true });
  const file = path.join(targetDir, "index.html");
  writeFileSync(file, html);
  written++;
  console.log(`[prerender] ${seo.route.padEnd(15)} → ${path.relative(DIST, file)}`);
}

console.log(`[prerender] Wrote ${written} HTML files to ${path.relative(process.cwd(), DIST)}`);
