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
import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { extname } from "node:path";
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

// ── Step 1. Write head-only versions for every route. ─────────────────
// These act as a fallback if the puppeteer body snapshot below fails or
// is skipped (e.g. when no Chrome binary is available — local builds).
let written = 0;
const headOnlyFiles = new Map(); // route → { file, headHtml }
for (const seo of routes) {
  const html = buildHtmlForRoute(seo);
  const targetDir =
    seo.route === "/" ? DIST : path.join(DIST, seo.route.replace(/^\//, ""));
  if (seo.route !== "/") mkdirSync(targetDir, { recursive: true });
  const file = path.join(targetDir, "index.html");
  writeFileSync(file, html);
  headOnlyFiles.set(seo.route, { file, headHtml: html });
  written++;
  console.log(
    `[prerender] head     ${seo.route.padEnd(15)} → ${path.relative(DIST, file)}`,
  );
}

// ── Step 2. Puppeteer body snapshot (CI-only). ────────────────────────
// On CI we have a system Chrome at well-known paths. Locally without
// Chrome we just skip — head-only versions are still in place. Picks
// up the system browser via puppeteer-core; we never download Chromium
// (that would add 150MB to install times for no gain).
async function detectChromeBinary() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    // GitHub Actions ubuntu-latest
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    // macOS dev
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];
  for (const p of candidates) {
    try {
      const s = await stat(p);
      if (s.isFile()) return p;
    } catch {
      /* not present, try next */
    }
  }
  return null;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".webm": "video/webm",
};

function spaServer(rootDir, port) {
  return new Promise((resolve) => {
    const srv = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://localhost");
        // SPA routing: try the requested path; if not a file, fall back
        // to that route's prerendered index.html (or root index.html).
        let pathname = decodeURIComponent(url.pathname);
        if (pathname.endsWith("/")) pathname += "index.html";
        let fsPath = path.join(rootDir, pathname);
        try {
          const s = await stat(fsPath);
          if (s.isDirectory()) fsPath = path.join(fsPath, "index.html");
        } catch {
          // Try as route-prerender path: /services → /services/index.html
          const routeDir = path.join(rootDir, pathname.replace(/^\//, ""));
          const routeIndex = path.join(routeDir, "index.html");
          try {
            await stat(routeIndex);
            fsPath = routeIndex;
          } catch {
            fsPath = path.join(rootDir, "index.html");
          }
        }
        const ext = extname(fsPath).toLowerCase();
        const data = readFileSync(fsPath);
        res.writeHead(200, {
          "content-type": MIME[ext] ?? "application/octet-stream",
          "content-length": data.length,
        });
        res.end(data);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    srv.listen(port, "127.0.0.1", () => resolve(srv));
  });
}

async function snapshotBody() {
  const chrome = await detectChromeBinary();
  if (!chrome) {
    console.log(
      "[prerender] No Chrome binary found — skipping body snapshot. Head-only HTML in place.",
    );
    return 0;
  }
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer-core")).default;
  } catch {
    console.log("[prerender] puppeteer-core not installed — skipping body snapshot.");
    return 0;
  }

  const port = 47318;
  const server = await spaServer(DIST, port);
  let browser;
  let snapped = 0;
  try {
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    for (const seo of routes) {
      const page = await browser.newPage();
      // Block the EntryGate loader so the actual page content renders.
      await page.evaluateOnNewDocument(() => {
        try {
          window.sessionStorage.setItem("itityl:entry-gate-passed", "1");
        } catch {
          /* ignore */
        }
      });
      // Pretend to be a search bot — some analytics may decide to skip.
      await page.setUserAgent(
        "Mozilla/5.0 (compatible; ItitylPrerender/1.0; +https://itityl.ru)",
      );
      await page.setViewport({ width: 1280, height: 800 });
      const url = `http://127.0.0.1:${port}${seo.route}`;
      try {
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });
        // Wait an extra moment for framer-motion stagger animations to
        // settle so the DOM is in its final state.
        await new Promise((r) => setTimeout(r, 500));
        // Capture the final document HTML. This includes our injected
        // head + the React-rendered body.
        const full = await page.evaluate(() => {
          // Strip framer-motion's inline transform styles so the
          // saved HTML doesn't carry mid-animation state.
          document
            .querySelectorAll("[style*='translate']")
            .forEach((el) => {
              const s = el.getAttribute("style");
              if (s) {
                el.setAttribute(
                  "style",
                  s
                    .split(";")
                    .filter((p) => !/(translate|opacity|transform)/i.test(p))
                    .join(";"),
                );
              }
            });
          return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
        });
        const entry = headOnlyFiles.get(seo.route);
        if (!entry) continue;
        writeFileSync(entry.file, full);
        snapped++;
        console.log(
          `[prerender] snapshot ${seo.route.padEnd(15)} → ${path.relative(DIST, entry.file)}`,
        );
      } catch (err) {
        console.warn(
          `[prerender] snapshot ${seo.route} FAILED: ${err.message}. Head-only HTML kept.`,
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
  return snapped;
}

const snapped = await snapshotBody();
console.log(
  `[prerender] Wrote ${written} HTML files, ${snapped} with body snapshot, to ${path.relative(process.cwd(), DIST)}`,
);
