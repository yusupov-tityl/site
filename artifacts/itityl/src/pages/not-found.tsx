import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useSeo } from "@/lib/useSeo";

export default function NotFound() {
  useSeo({
    title: "Страница не найдена — Ай-Титул",
    description: "Запрошенная страница не существует или была перемещена.",
    noindex: true,
  });
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-6 gap-3">
          <AlertCircle className="h-8 w-8 text-amber-300" />
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">
            404
          </h1>
        </div>
        <p className="text-white/70 mb-8">
          Страница не найдена. Возможно, она была перемещена или удалена.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-amber-300 text-amber-300 hover:bg-amber-300 hover:text-black transition-colors text-sm uppercase tracking-[0.2em] font-bold"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
