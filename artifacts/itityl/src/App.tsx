import { lazy, Suspense, useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig, LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { ComingSoon } from "@/pages/coming-soon";
import { CustomCursor } from "@/components/CustomCursor";
import { EntryGate } from "@/components/EntryGate";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContactModalProvider } from "@/lib/contact-modal";
import { IntroContext } from "@/lib/intro-context";

// Shared singleton so every useMutation/useQuery in the app plugs into
// the same cache (ContactForm hooks need this via @workspace/api-client-react).
const queryClient = new QueryClient();

// Code-split infrequently used parts out of the initial bundle so the
// home page ships without the privacy page, the cookie banner, secondary
// routes, and the background-music widget bolted onto it. Only Home is
// eager — it's the landing page and the loader is already interactive.
const Privacy = lazy(() =>
  import("@/pages/privacy").then((m) => ({ default: m.default })),
);
const Products = lazy(() => import("@/pages/products"));
const Technologies = lazy(() => import("@/pages/technologies"));
const Services = lazy(() => import("@/pages/services"));
const ConsentBanner = lazy(() =>
  import("@/components/ConsentBanner").then((m) => ({ default: m.ConsentBanner })),
);
const SmoothScroll = lazy(() =>
  import("@/components/SmoothScroll").then((m) => ({ default: m.SmoothScroll })),
);
const ContactModal = lazy(() =>
  import("@/components/ContactModal").then((m) => ({ default: m.ContactModal })),
);
// Hoisted out of home.tsx so the music + control pill keep playing across
// route changes (privacy, products, services, etc.) instead of re-mounting
// and dropping the audio every time.
const BgMusic = lazy(() =>
  import("@/components/BgMusic").then((m) => ({ default: m.BgMusic })),
);

// Once the user has passed the loader in this browser session we don't
// want to show it again — including when they navigate to /privacy or
// hit refresh on a deep link. Stored in sessionStorage so a fresh tab
// still gets the intro.
const ENTRY_GATE_FLAG = "itityl:entry-gate-passed";

function readEntryGatePassed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(ENTRY_GATE_FLAG) === "1";
  } catch {
    return false;
  }
}

// Match the moment the loader starts sliding up (so hero words begin revealing
// underneath while the curtain is still moving away).
const HERO_DELAY_DURING_INTRO = 1.85;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/privacy" component={Privacy} />

      <Route path="/products" component={Products} />
      <Route path="/products/ai-agents">
        <ComingSoon title="ИИ-агенты для бизнеса" parentLabel="Продукты" parentTo="/products" />
      </Route>
      <Route path="/products/smart-office">
        <ComingSoon title="Интеллектуальная канцелярия" parentLabel="Продукты" parentTo="/products" />
      </Route>
      <Route path="/products/document-analyst">
        <ComingSoon title="Аналитик документов" parentLabel="Продукты" parentTo="/products" />
      </Route>
      <Route path="/products/rag">
        <ComingSoon title="RAG по внутренним документам" parentLabel="Продукты" parentTo="/products" />
      </Route>

      <Route path="/technologies" component={Technologies} />

      <Route path="/services" component={Services} />
      <Route path="/services/ai-consulting">
        <ComingSoon title="AI-консалтинг и выявление сценариев" parentLabel="Услуги" parentTo="/services" />
      </Route>
      <Route path="/services/process-audit">
        <ComingSoon title="Обследование бизнес-процессов и ИТ-ландшафта" parentLabel="Услуги" parentTo="/services" />
      </Route>
      <Route path="/services/portfolio">
        <ComingSoon title="Формирование портфеля ИИ-инициатив" parentLabel="Услуги" parentTo="/services" />
      </Route>
      <Route path="/services/pilots">
        <ComingSoon title="Пилоты и проверка гипотез" parentLabel="Услуги" parentTo="/services" />
      </Route>
      <Route path="/services/development">
        <ComingSoon title="Разработка ИИ-решений" parentLabel="Услуги" parentTo="/services" />
      </Route>
      <Route path="/services/integration">
        <ComingSoon title="Интеграция в корпоративные системы" parentLabel="Услуги" parentTo="/services" />
      </Route>
      <Route path="/services/support">
        <ComingSoon title="Сопровождение и развитие" parentLabel="Услуги" parentTo="/services" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loaderShown, setLoaderShown] = useState<boolean>(() => readEntryGatePassed());

  useEffect(() => {
    if (loaderShown) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loaderShown]);

  const handleDone = () => {
    try {
      window.sessionStorage.setItem(ENTRY_GATE_FLAG, "1");
    } catch {
      // ignore — sessionStorage may be blocked in private mode
    }
    setLoaderShown(true);
  };

  const heroDelay = loaderShown ? 0 : HERO_DELAY_DURING_INTRO;

  return (
    <QueryClientProvider client={queryClient}>
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <IntroContext.Provider value={{ heroDelay }}>
          <ContactModalProvider>
          {!loaderShown && <EntryGate onEnter={handleDone} />}
          {/* Make the rest of the app inert while the loader is up so
              keyboard focus and screen readers don't leak into hidden UI. */}
          <div {...({ inert: !loaderShown ? "" : undefined } as Record<string, string | undefined>)}>
            {/* Lenis + ContactModal + ConsentBanner are all lazy so none
                of them block first paint of the hero. */}
            {loaderShown && (
              <Suspense fallback={null}>
                <SmoothScroll />
              </Suspense>
            )}
            <CustomCursor />
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ScrollToTop />
              <Suspense fallback={null}>
                <Router />
              </Suspense>
            </WouterRouter>
            <Suspense fallback={null}>
              <ContactModal />
            </Suspense>
            {/* Global background music — mounted eagerly (not gated by
                loaderShown) so the very click that dismisses the EntryGate
                IS the user gesture that unmutes the track. If we waited
                until after the loader, BgMusic would mount one frame too
                late and the unmute would only fire on the user's NEXT
                interaction with the page. */}
            <Suspense fallback={null}>
              <BgMusic src={`${import.meta.env.BASE_URL}bg-music.mp3`} />
            </Suspense>
            <Toaster />
            {loaderShown && (
              <Suspense fallback={null}>
                <ConsentBanner />
              </Suspense>
            )}
          </div>
          </ContactModalProvider>
        </IntroContext.Provider>
      </TooltipProvider>
    </MotionConfig>
    </LazyMotion>
    </QueryClientProvider>
  );
}

export default App;
