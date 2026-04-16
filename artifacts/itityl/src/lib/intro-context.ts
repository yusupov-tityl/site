import { createContext, useContext } from "react";

export type IntroState = {
  /** Seconds to wait before hero reveal animations start. 0 if no intro played. */
  heroDelay: number;
};

export const IntroContext = createContext<IntroState>({ heroDelay: 0 });

export function useIntro() {
  return useContext(IntroContext);
}
