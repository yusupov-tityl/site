import { useEffect } from "react";

const SITE_ORIGIN = "https://itityl.ru";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/opengraph.jpg`;

type SeoOptions = {
  /** Page title — appears in <title> AND og:title / twitter:title. */
  title: string;
  /** ~150-160 char meta description. Used for SERP snippet + OG/Twitter. */
  description?: string;
  /** Canonical path (e.g. "/services"). Defaults to current location.pathname. */
  path?: string;
  /** OG image URL. Falls back to /opengraph.jpg. */
  ogImage?: string;
  /** Set to true to send `<meta name="robots" content="noindex">` for this page. */
  noindex?: boolean;
};

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute("content");
  el.setAttribute("content", content);
  return { el, prev };
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  const prev = el.getAttribute("href");
  el.href = href;
  return { el, prev };
}

/**
 * Sets per-page SEO metadata: title, description, canonical, Open Graph,
 * Twitter, robots. Restores previous values on unmount so navigating
 * between routes never leaves stale meta on the page.
 *
 * Both legacy signatures are supported:
 *   useSeo("Title")
 *   useSeo("Title", "Description")
 *   useSeo({ title, description, path, ogImage, noindex })
 */
export function useSeo(
  arg1: string | SeoOptions,
  legacyDescription?: string,
) {
  const opts: SeoOptions =
    typeof arg1 === "string"
      ? { title: arg1, description: legacyDescription }
      : arg1;

  const { title, description, path, ogImage, noindex } = opts;
  const canonical =
    SITE_ORIGIN +
    (path ?? (typeof window !== "undefined" ? window.location.pathname : "/"));
  const og = ogImage ?? DEFAULT_OG_IMAGE;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const restore: Array<() => void> = [];

    if (description) {
      const { el, prev } = setMeta(
        'meta[name="description"]',
        "name",
        "description",
        description,
      );
      restore.push(() =>
        prev !== null ? el.setAttribute("content", prev) : el.remove(),
      );
    }

    // Canonical
    {
      const { el, prev } = setLink("canonical", canonical);
      restore.push(() => (prev !== null ? (el.href = prev) : el.remove()));
    }

    // Open Graph
    const ogTags: Array<[string, string]> = [
      ["og:title", title],
      ["og:url", canonical],
      ["og:type", "website"],
      ["og:site_name", "Ай-Титул"],
      ["og:image", og],
      ["og:locale", "ru_RU"],
    ];
    if (description) ogTags.push(["og:description", description]);
    for (const [key, val] of ogTags) {
      const sel = `meta[property="${key}"]`;
      const { el, prev } = setMeta(sel, "property", key, val);
      restore.push(() =>
        prev !== null ? el.setAttribute("content", prev) : el.remove(),
      );
    }

    // Twitter
    const twitterTags: Array<[string, string]> = [
      ["twitter:card", "summary_large_image"],
      ["twitter:title", title],
      ["twitter:image", og],
    ];
    if (description) twitterTags.push(["twitter:description", description]);
    for (const [key, val] of twitterTags) {
      const sel = `meta[name="${key}"]`;
      const { el, prev } = setMeta(sel, "name", key, val);
      restore.push(() =>
        prev !== null ? el.setAttribute("content", prev) : el.remove(),
      );
    }

    // Robots — only emit when noindex is explicitly true; default behaviour
    // is "indexable" and we don't want to fight the site-wide meta from
    // index.html.
    if (noindex) {
      const { el, prev } = setMeta(
        'meta[name="robots"]',
        "name",
        "robots",
        "noindex, nofollow",
      );
      restore.push(() =>
        prev !== null ? el.setAttribute("content", prev) : el.remove(),
      );
    }

    return () => {
      document.title = prevTitle;
      for (const fn of restore) fn();
    };
  }, [title, description, canonical, og, noindex]);
}
