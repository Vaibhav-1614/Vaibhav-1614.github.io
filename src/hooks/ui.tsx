import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { projects } from "../data/projects";

type UI = {
  activeProject: string | null;
  openProject: (slug: string) => void;
  closeProject: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  toast: (message: string) => void;
  toastMessage: { id: number; text: string } | null;
};

const UIContext = createContext<UI | null>(null);

const projectFromHash = () => {
  const match = window.location.hash.match(/^#project\/([\w-]+)/);
  return match && projects.some((p) => p.slug === match[1]) ? match[1] : null;
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<string | null>(projectFromHash);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<UI["toastMessage"]>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const openProject = useCallback((slug: string) => {
    setActiveProject(slug);
    history.pushState(null, "", `#project/${slug}`);
  }, []);

  const closeProject = useCallback(() => {
    setActiveProject(null);
    if (window.location.hash.startsWith("#project/")) {
      history.pushState(null, "", window.location.pathname + window.location.search + "#projects");
    }
  }, []);

  useEffect(() => {
    const onPop = () => setActiveProject(projectFromHash());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMessage({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2600);
  }, []);

  const value = useMemo(
    () => ({
      activeProject,
      openProject,
      closeProject,
      paletteOpen,
      setPaletteOpen,
      toast,
      toastMessage,
    }),
    [activeProject, openProject, closeProject, paletteOpen, toast, toastMessage],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
