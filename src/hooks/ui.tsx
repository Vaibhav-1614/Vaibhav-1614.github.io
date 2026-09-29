import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { projects } from "../data/projects";

type Theme = "light" | "dark";

type UI = {
  theme: Theme;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  setTheme: (theme: Theme, origin?: { x: number; y: number }) => void;
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
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const [activeProject, setActiveProject] = useState<string | null>(projectFromHash);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<UI["toastMessage"]>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const setTheme = useCallback<UI["setTheme"]>((next, origin) => {
    const apply = () => {
      flushSync(() => setThemeState(next));
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* storage unavailable: theme still applies for this visit */
      }
      window.dispatchEvent(new Event("themechange"));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) {
      apply();
      return;
    }

    const x = origin?.x ?? window.innerWidth - 40;
    const y = origin?.y ?? 40;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }, []);

  const toggleTheme = useCallback<UI["toggleTheme"]>(
    (origin) => setTheme(theme === "dark" ? "light" : "dark", origin),
    [theme, setTheme],
  );

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
      theme,
      toggleTheme,
      setTheme,
      activeProject,
      openProject,
      closeProject,
      paletteOpen,
      setPaletteOpen,
      toast,
      toastMessage,
    }),
    [theme, toggleTheme, setTheme, activeProject, openProject, closeProject, paletteOpen, toast, toastMessage],
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
