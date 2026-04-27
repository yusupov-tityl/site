import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSentry, initYandexMetrica } from "./lib/telemetry";
// Side-effect import: kicks off AudioContext creation, mp3 fetch and
// the gesture-unlock listener as early as physically possible. Has to
// happen BEFORE React mounts — otherwise a fast first click on a slow
// connection could land before the BgMusic chunk loads, miss the only
// user-gesture window, and leave audio permanently locked on iOS.
import "./lib/audio-bootstrap";

// Telemetry boots before React renders so any error in mount itself
// is captured. Both calls are no-ops if env vars are unset.
initSentry();
initYandexMetrica();

createRoot(document.getElementById("root")!).render(<App />);
