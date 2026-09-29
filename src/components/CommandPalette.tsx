import { useEffect } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Briefcase, Code2, Copy, ExternalLink, FileCode2, Home, Mail, Moon, Sun, User } from "lucide-react";
import { EMAIL, GITHUB_USER, projects } from "../data/projects";
import { copyText, useUI } from "../hooks/ui";
import { GitHubIcon } from "./primitives";

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, openProject, closeProject, activeProject, theme, setTheme, toast } = useUI();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen]);

  const run = (fn: () => void) => () => {
    setPaletteOpen(false);
    setTimeout(fn, 80);
  };

  const goTo = (id: string) =>
    run(() => {
      if (activeProject) closeProject();
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), activeProject ? 350 : 0);
    });

  const item =
    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text transition-colors [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted";

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPaletteOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)]"
          >
            <Command
              label="Command menu"
              loop
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setPaletteOpen(false);
                }
              }}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span className="font-mono text-accent">&gt;</span>
                <Command.Input
                  autoFocus
                  placeholder="Search projects, sections, actions…"
                  className="h-14 flex-1 bg-transparent text-heading outline-none placeholder:text-muted"
                />
                <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
              </div>
              <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-8 text-center text-sm text-muted">No results. Try "rag" or "email".</Command.Empty>

                <Command.Group heading="Projects">
                  {projects.map((p) => (
                    <Command.Item
                      key={p.slug}
                      value={`${p.title} ${p.kicker} ${p.stack.join(" ")}`}
                      onSelect={run(() => openProject(p.slug))}
                      className={item}
                    >
                      <Briefcase />
                      <span className="flex-1">
                        {p.title}
                        <span className="ml-2 font-mono text-[11px] text-muted">{p.kicker}</span>
                      </span>
                      <ArrowRight className="opacity-50" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Navigate">
                  {[
                    ["top", "Home", Home],
                    ["about", "About", User],
                    ["skills", "Skills", Code2],
                    ["projects", "Projects", Briefcase],
                    ["contact", "Contact", Mail],
                  ].map(([id, label, Icon]) => {
                    const I = Icon as typeof Home;
                    return (
                      <Command.Item key={id as string} value={`go ${label}`} onSelect={goTo(id as string)} className={item}>
                        <I /> {label as string}
                      </Command.Item>
                    );
                  })}
                </Command.Group>

                <Command.Group heading="Actions">
                  <Command.Item
                    value="copy email address"
                    onSelect={run(() => copyText(EMAIL).then((ok) => toast(ok ? "Email copied to clipboard" : EMAIL)))}
                    className={item}
                  >
                    <Copy /> Copy email address
                    <span className="ml-auto font-mono text-[11px] text-muted">{EMAIL}</span>
                  </Command.Item>
                  <Command.Item value="send email" onSelect={run(() => (window.location.href = `mailto:${EMAIL}`))} className={item}>
                    <Mail /> Send an email
                  </Command.Item>
                  <Command.Item
                    value="toggle theme dark light mode"
                    onSelect={run(() => setTheme(theme === "dark" ? "light" : "dark"))}
                    className={item}
                  >
                    {theme === "dark" ? <Sun /> : <Moon />} Switch to {theme === "dark" ? "light" : "dark"} theme
                  </Command.Item>
                  <Command.Item
                    value="github profile"
                    onSelect={run(() => window.open(`https://github.com/${GITHUB_USER}`, "_blank", "noopener"))}
                    className={item}
                  >
                    <GitHubIcon /> Open GitHub profile
                    <ExternalLink className="ml-auto opacity-50" />
                  </Command.Item>
                  <Command.Item
                    value="rag live demo streamlit"
                    onSelect={run(() => window.open(projects[0].demo, "_blank", "noopener"))}
                    className={item}
                  >
                    <ExternalLink /> Open RAG live demo
                  </Command.Item>
                  <Command.Item
                    value="view source code of this site"
                    onSelect={run(() =>
                      window.open(`https://github.com/${GITHUB_USER}/${GITHUB_USER}.github.io`, "_blank", "noopener"),
                    )}
                    className={item}
                  >
                    <FileCode2 /> View this site's source
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
                <span>
                  <kbd>↑↓</kbd> navigate
                </span>
                <span>
                  <kbd>↵</kbd> select
                </span>
                <span className="ml-auto">
                  <span className="text-accent">&lt;VS/&gt;</span> command menu
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
