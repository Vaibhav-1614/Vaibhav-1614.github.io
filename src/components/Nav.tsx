import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Briefcase, Code2, Mail, Search, User } from "lucide-react";
import { useUI } from "../hooks/ui";
import { isMac } from "./primitives";

const links = [
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "contact", label: "Contact", icon: Mail },
];

export function Nav() {
  const { setPaletteOpen } = useUI();
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    // The poster carries its own nav, so this one only appears once it has scrolled away.
    setShown(v > window.innerHeight * 0.85);
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

  return (
    <motion.header
      className="fixed inset-x-0 top-3 z-[60] flex justify-center px-3 md:top-4"
      initial={false}
      animate={shown ? { y: 0, opacity: 1 } : { y: -90, opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      inert={!shown}
    >
      <nav
        aria-label="Main"
        className="flex items-center gap-1 rounded-full border border-line bg-surface/80 px-2 py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <a href="#top" className="mr-1 grid size-9 place-items-center rounded-full text-heading" aria-label="Back to top">
          <svg viewBox="0 0 66 62" className="size-4" aria-hidden="true" stroke="currentColor" strokeWidth="6" strokeLinecap="square">
            <line x1="33" y1="1" x2="33" y2="61" />
            <line x1="3" y1="31" x2="63" y2="31" />
            <line x1="11.8" y1="9.8" x2="54.2" y2="52.2" />
            <line x1="54.2" y1="9.8" x2="11.8" y2="52.2" />
          </svg>
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

      </nav>
    </motion.header>
  );
}
