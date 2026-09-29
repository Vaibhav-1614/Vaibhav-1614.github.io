import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Briefcase, Code2, Mail, Moon, Search, Sun, User } from "lucide-react";
import { useUI } from "../hooks/ui";
import { isMac } from "./primitives";

const links = [
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "contact", label: "Contact", icon: Mail },
];

export function Nav() {
  const { theme, toggleTheme, setPaletteOpen } = useUI();
  const [active, setActive] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setCompact(v > 40);
    if (v < window.innerHeight * 0.4) setActive(null);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const onTheme = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-3 z-[60] flex justify-center px-3 md:top-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        aria-label="Main"
        className={`flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-xl transition-all duration-500 ${
          compact ? "border-line bg-surface/75 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]" : "border-transparent bg-surface/30"
        }`}
      >
        <a href="#top" className="mr-1 rounded-full px-3 py-1.5 font-mono text-sm font-semibold text-heading">
          <span className="text-accent">&lt;</span>VS<span className="text-accent">/&gt;</span>
        </a>

        {links.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active === id ? "text-heading" : "text-muted hover:text-heading"
            }`}
            aria-current={active === id ? "true" : undefined}
          >
            {active === id && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 -z-10 rounded-full border border-accent/30 bg-accent/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className="size-4 sm:hidden" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{label}</span>
          </a>
        ))}

        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm text-muted transition-colors hover:text-heading"
          aria-label="Open command menu"
        >
          <Search className="size-4" />
          <kbd className="hidden rounded border border-line bg-bg/60 px-1.5 font-mono text-[10px] md:inline">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onTheme}
          className="relative grid size-8 place-items-center overflow-hidden rounded-full text-muted transition-colors hover:text-heading"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ y: -20, rotate: -90, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              exit={{ y: 20, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>
    </motion.header>
  );
}
