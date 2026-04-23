import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ContactModalState = {
  isOpen: boolean;
  source: string | null;
  open: (source: string) => void;
  close: () => void;
};

const Ctx = createContext<ContactModalState | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  const open = useCallback((src: string) => {
    setSource(src);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<ContactModalState>(
    () => ({ isOpen, source, open, close }),
    [isOpen, source, open, close],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContactModal(): ContactModalState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      isOpen: false,
      source: null,
      open: () => {},
      close: () => {},
    };
  }
  return ctx;
}
