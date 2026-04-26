import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSentry, initYandexMetrica } from "./lib/telemetry";

// Telemetry boots before React renders so any error in mount itself
// is captured. Both calls are no-ops if env vars are unset.
initSentry();
initYandexMetrica();

createRoot(document.getElementById("root")!).render(<App />);
