import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Privacy from "@/pages/privacy";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { EntryGate } from "@/components/EntryGate";
import { ConsentBanner } from "@/components/ConsentBanner";
import { IntroContext } from "@/lib/intro-context";

const queryClient = new QueryClient();

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
                <Router />
              </WouterRouter>
              <Toaster />
              {loaderShown && <ConsentBanner />}
            </div>
          </IntroContext.Provider>
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
