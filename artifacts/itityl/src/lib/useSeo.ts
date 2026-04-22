import { useEffect } from "react";

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? null;
    if (description) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
    return () => {
      document.title = prevTitle;
      if (description && meta) {
        if (prevDesc !== null) meta.setAttribute("content", prevDesc);
        else meta.removeAttribute("content");
      }
    };
  }, [title, description]);
}
