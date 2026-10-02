import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lightbulb,
  Link2,
  Sparkles,
  Star,
  Target,
  Wrench,
  X,
} from "lucide-react";
import { GITHUB_USER, categoryLabels, imagePath, projects, type Category, type Project } from "../data/projects";
import { copyText, useUI } from "../hooks/ui";
import { Gallery } from "./Gallery";
import { RagChart } from "./RagChart";
import { Counter, GitHubIcon, SectionHeading, trackSpotlight } from "./primitives";

const spring = { type: "spring", stiffness: 260, damping: 30 } as const;
const repoUrl = (p: Project) => `https://github.com/${GITHUB_USER}/${p.repo}`;

/* ---------- Live repo metadata from the GitHub API (best effort) ---------- */
type RepoMeta = { pushed_at: string; stargazers_count: number; language: string | null };

function useRepoMeta(repo: string) {
  const [meta, setMeta] = useState<RepoMeta | null>(null);
  useEffect(() => {
    const key = `repo:${repo}`;
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        setMeta(JSON.parse(cached));
        return;
      }
    } catch {
      /* ignore */
    }
    const controller = new AbortController();
    fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const m = { pushed_at: data.pushed_at, stargazers_count: data.stargazers_count, language: data.language };
        setMeta(m);
        try {
          sessionStorage.setItem(key, JSON.stringify(m));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [repo]);
  return meta;
}

const timeAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months} month${months > 1 ? "s" : ""} ago` : `${Math.floor(months / 12)}y ago`;
};

/* ---------- Section ---------- */
export function Projects() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const { activeProject } = useUI();
  const visible = useMemo(() => projects.filter((p) => filter === "all" || p.categories.includes(filter)), [filter]);
  const active = projects.find((p) => p.slug === activeProject) ?? null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading
        index="03"
        title="Projects"
        subtitle="Click any project for the full story: the problem, what I built, results, screenshots and the tech behind it."
      />

      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
        <LayoutGroup id="filters">
          {(["all", "ai", "analytics", "backend"] as const).map((c) => {
            const count = c === "all" ? projects.length : projects.filter((p) => p.categories.includes(c)).length;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === c ? "text-accent-ink" : "text-muted hover:text-heading"
                }`}
              >
                {filter === c && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-accent" transition={spring} />}
                <span className="relative">
                  {categoryLabels[c]} <span className="font-mono text-xs opacity-70">{count}</span>
                </span>
              </button>
            );
          })}
        </LayoutGroup>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <ProjectCard key={p.slug} project={p} featured={i === 0 && filter === "all"} />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href={`https://github.com/${GITHUB_USER}?tab=repositories`}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center gap-2 rounded-xl border border-line-strong px-5 py-3 text-sm font-semibold text-heading transition-colors hover:border-accent hover:text-accent"
        >
          <GitHubIcon /> See all repositories
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      {createPortal(<AnimatePresence>{active && <ProjectDialog key={active.slug} project={active} />}</AnimatePresence>, document.body)}
    </section>
  );
}

/* ---------- Card ---------- */
function ProjectCard({ project: p, featured }: { project: Project; featured: boolean }) {
  const { openProject, activeProject } = useUI();
  const isOpen = activeProject === p.slug;

  return (
    <motion.article
      layoutId={`card-${p.slug}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={spring}
      style={{ borderRadius: 20 }}
      data-cursor="view"
      onPointerMove={trackSpotlight}
      onClick={() => openProject(p.slug)}
      className={`spotlight group flex cursor-pointer flex-col overflow-hidden border border-line bg-card transition-colors hover:bg-card-hover ${
        featured ? "md:col-span-2 lg:flex-row" : ""
      } ${isOpen ? "invisible" : ""}`}
    >
      <motion.div
        layoutId={`cover-${p.slug}`}
        className={`relative overflow-hidden bg-bg ${featured ? "h-56 sm:h-64 lg:h-auto lg:w-[55%]" : "h-52"}`}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 bg-gradient-to-b from-black/50 to-transparent px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <img
          src={imagePath(p.slug, p.cover, true)}
          alt=""
          loading="lazy"
          className="size-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        {featured && (
          <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-semibold text-accent-ink">
            <Sparkles className="size-3" /> Latest
          </span>
        )}
      </motion.div>

      <div className={`flex flex-1 flex-col p-6 ${featured ? "lg:p-8" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">{p.kicker}</span>
          <a
            href={repoUrl(p)}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${p.title} on GitHub`}
            className="text-muted transition-colors hover:text-accent"
          >
            <GitHubIcon className="size-5" />
          </a>
        </div>
        <motion.h3 layoutId={`title-${p.slug}`} className="mt-3 font-display text-[2rem] leading-tight tracking-[-0.01em] text-heading">
          {p.title}
        </motion.h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.tagline}</p>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-4">
          {p.metrics.slice(0, 3).map((m) => (
            <div key={m.label}>
              <dt className="sr-only">{m.label}</dt>
              <dd className="font-mono text-lg font-semibold text-heading tabular-nums">
                {m.prefix}
                {m.value.toLocaleString("en-US", { minimumFractionDigits: m.decimals ?? 0 })}
                {m.suffix}
              </dd>
              <dd className="mt-0.5 text-[11px] leading-snug text-muted">{m.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.slice(0, featured ? 7 : 5).map((t) => (
            <span key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openProject(p.slug);
            }}
            className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent ring-1 ring-accent/30 transition-colors hover:bg-accent hover:text-accent-ink"
            aria-haspopup="dialog"
          >
            Know more
            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-heading"
            >
              Live demo <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Dialog ---------- */
function Block({ icon: Icon, title, children, id }: { icon: typeof Target; title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h3 className="mb-4 flex items-center gap-2.5 font-display text-2xl text-heading">
        <span className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
          <Icon className="size-4" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ProjectDialog({ project: p }: { project: Project }) {
  const { closeProject, openProject, toast } = useUI();
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const meta = useRepoMeta(p.repo);
  const index = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  // Scroll lock, initial focus, focus trap, Esc to close, focus restore.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [closeProject]);

  const jump = (id: string) => {
    const el = scrollRef.current?.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tabs = [
    ["overview", "Overview"],
    ...(p.slug === "rag" ? [["benchmark", "Benchmark"]] : []),
    ["screenshots", "Screenshots"],
    ["engineering", "Engineering"],
    ["stack", "Skills & stack"],
  ];

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4 md:p-6">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeProject}
      />
      <motion.div
        ref={dialogRef}
        layoutId={`card-${p.slug}`}
        transition={spring}
        style={{ borderRadius: 24 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dialog-title-${p.slug}`}
        className="relative flex h-[94svh] w-full max-w-5xl flex-col overflow-hidden border border-line bg-surface shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] sm:h-[92svh]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={closeProject}
          aria-label="Close project"
          className="absolute top-3 right-3 z-30 grid size-10 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-black/70"
        >
          <X className="size-5" />
        </button>

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
          <motion.div layoutId={`cover-${p.slug}`} className="relative h-48 overflow-hidden bg-bg sm:h-64">
            <img src={imagePath(p.slug, p.cover, true)} alt="" className="size-full scale-105 object-cover object-top opacity-70 blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/75 to-surface/10" />
          </motion.div>

          <div className="relative -mt-16 px-5 sm:px-8 md:px-10">
            <motion.span {...fade(0.1)} className="font-mono text-xs tracking-[0.14em] text-accent uppercase">
              {p.kicker}
            </motion.span>
            <motion.h2
              layoutId={`title-${p.slug}`}
              id={`dialog-title-${p.slug}`}
              className="mt-2 font-display text-4xl leading-tight tracking-[-0.01em] text-heading sm:text-5xl"
            >
              {p.title}
            </motion.h2>
            <motion.p {...fade(0.15)} className="mt-3 max-w-3xl text-lg text-muted">
              {p.tagline}
            </motion.p>

            <motion.div {...fade(0.2)} className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={repoUrl(p)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-heading px-4 py-2.5 text-sm font-semibold text-surface transition hover:opacity-90"
              >
                <GitHubIcon /> View code
              </a>
              {p.demo && (
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:opacity-90"
                >
                  <ExternalLink className="size-4" /> Live demo
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  copyText(window.location.href).then((ok) => toast(ok ? "Link to this project copied" : "Couldn't copy the link"))
                }
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold text-heading transition hover:border-accent hover:text-accent"
              >
                <Link2 className="size-4" /> Share
              </button>
              {meta && (
                <span className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> updated {timeAgo(meta.pushed_at)}
                  </span>
                  {meta.language && <span>{meta.language}</span>}
                  {meta.stargazers_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5" /> {meta.stargazers_count}
                    </span>
                  )}
                </span>
              )}
            </motion.div>
          </div>

          {/* In-dialog section tabs */}
          <motion.nav
            {...fade(0.25)}
            aria-label="Project sections"
            className="sticky top-0 z-20 mt-8 flex gap-1 overflow-x-auto border-y border-line bg-surface/95 px-5 py-2 backdrop-blur-xl sm:px-8 md:px-10"
          >
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => jump(id)}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-heading"
              >
                {label}
              </button>
            ))}
          </motion.nav>

          <motion.div {...fade(0.3)} className="space-y-14 px-5 py-10 sm:px-8 md:px-10">
            <div id="overview" className="scroll-mt-20 space-y-10">
              {/* At a glance */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {p.metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-line bg-card p-4">
                    <div className="font-mono text-2xl font-semibold text-accent sm:text-3xl">
                      <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} duration={1.3} />
                    </div>
                    <div className="mt-1 text-xs leading-snug text-muted">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Plain-English summary for non-technical readers */}
              <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 via-transparent to-accent-soft/5 p-6">
                <div className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-accent uppercase">
                  <Lightbulb className="size-4" /> In plain English
                </div>
                <p className="mt-3 text-lg leading-relaxed text-heading">{p.plainEnglish}</p>
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                <Block icon={Target} title="The problem">
                  <p className="leading-relaxed text-muted">{p.problem}</p>
                </Block>
                <Block icon={CheckCircle2} title="Results">
                  <ul className="space-y-3">
                    {p.results.map((r, i) => (
                      <motion.li
                        key={i}
                        className="flex gap-3 leading-relaxed text-muted"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, root: scrollRef }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-accent" />
                        <span>{r}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Block>
              </div>

              <Block icon={Wrench} title="What I built">
                <ol className="relative space-y-5 border-l border-line pl-7">
                  {p.approach.map((step, i) => (
                    <motion.li
                      key={i}
                      className="relative leading-relaxed text-muted"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, root: scrollRef }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <span className="absolute top-0.5 -left-[2.4rem] grid size-6 place-items-center rounded-full border border-accent/40 bg-surface font-mono text-[11px] text-accent">
                        {i + 1}
                      </span>
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </Block>
            </div>

            {p.slug === "rag" && (
              <Block id="benchmark" icon={Sparkles} title="Explore the benchmark">
                <p className="mb-4 text-muted">
                  All 15 unique configurations (BM25 doesn't use embeddings, so it appears once per chunk size). Switch the
                  metric and watch the ranking reshuffle.
                </p>
                <RagChart />
              </Block>
            )}

            <Block id="screenshots" icon={ExternalLink} title="Screenshots">
              <Gallery slug={p.slug} shots={p.screenshots} title={p.title} />
            </Block>

            <Block id="engineering" icon={Lightbulb} title="Engineering decisions worth noting">
              <div className="grid gap-4 md:grid-cols-3">
                {p.highlights.map((h, i) => (
                  <motion.div
                    key={h.title}
                    onPointerMove={trackSpotlight}
                    className="spotlight rounded-2xl border border-line bg-card p-5"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, root: scrollRef }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <h4 className="font-semibold text-heading">{h.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{h.body}</p>
                  </motion.div>
                ))}
              </div>
            </Block>

            <Block id="stack" icon={Wrench} title="Skills demonstrated & tech stack">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-3 font-mono text-xs tracking-[0.14em] text-muted uppercase">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {p.skills.map((s) => (
                      <span key={s} className="rounded-full bg-accent/10 px-3 py-1 text-sm text-accent ring-1 ring-accent/25">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 font-mono text-xs tracking-[0.14em] text-muted uppercase">Tech stack</div>
                  <div className="flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-heading">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Block>

            {/* Prev / next */}
            <div className="grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {[
                { p: prev, dir: "Previous", Icon: ArrowLeft },
                { p: next, dir: "Next", Icon: ArrowRight },
              ].map(({ p: q, dir, Icon }) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => {
                    scrollRef.current?.scrollTo({ top: 0 });
                    openProject(q.slug);
                  }}
                  className={`group flex items-center gap-4 rounded-2xl border border-line p-4 text-left transition-colors hover:border-accent/50 hover:bg-card ${
                    dir === "Next" ? "sm:flex-row-reverse sm:text-right" : ""
                  }`}
                >
                  <Icon className="size-5 shrink-0 text-accent transition-transform group-hover:scale-125" />
                  <span>
                    <span className="block font-mono text-[11px] tracking-wider text-muted uppercase">{dir} project</span>
                    <span className="font-semibold text-heading">{q.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
