import { lazy, Suspense, useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig, LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { EntryGate } from "@/components/EntryGate";
import { IntroContext } from "@/lib/intro-context";

// Shared singleton so every useMutation/useQuery in the app plugs into
// the same cache (ContactForm hooks need this via @workspace/api-client-react).
const queryClient = new QueryClient();

// Code-split infrequently used parts out of the initial bundle so the
// home page ships without the privacy page, the cookie banner, and the
// background-music widget bolted onto it.
const Privacy = lazy(() =>
  import("@/pages/privacy").then((m) => ({ default: m.default })),
);
const ConsentBanner = lazy(() =>
  import("@/components/ConsentBanner").then((m) => ({ default: m.ConsentBanner })),
);

// Match the moment the loader starts sliding up (so hero words begin revealing
// underneath while the curtain is still moving away).
const HERO_DELAY_DURING_INTRO = 1.85;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loaderShown, setLoaderShown] = useState(false);

  useEffect(() => {
    if (loaderShown) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loaderShown]);

  const handleDone = () => {
    setLoaderShown(true);
  };

  const heroDelay = loaderShown ? 0 : HERO_DELAY_DURING_INTRO;

  return (
    <QueryClientProvider client={queryClient}>
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <IntroContext.Provider value={{ heroDelay }}>
          {!loaderShown && <EntryGate onEnter={handleDone} />}
          {/* Make the rest of the app inert while the loader is up so
              keyboard focus and screen readers don't leak into hidden UI. */}
          <div {...({ inert: !loaderShown ? "" : undefined } as Record<string, string | undefined>)}>
            <SmoothScroll />
            <CustomCursor />
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Suspense fallback={null}>
                <Router />
              </Suspense>
            </WouterRouter>
            <Toaster />
            {loaderShown && (
              <Suspense fallback={null}>
                <ConsentBanner />
              </Suspense>
            )}
          </div>
        </IntroContext.Provider>
      </TooltipProvider>
    </MotionConfig>
    </LazyMotion>
    </QueryClientProvider>
  );
}

export default App;
