import { motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ParticleField } from "./effects";
import { Counter, Magnetic, TextScramble, isMac } from "./primitives";
import { useUI } from "../hooks/ui";

const ease = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
};

const stats = [
  { value: 5, label: "end-to-end projects shipped" },
  { value: 18, label: "RAG configs benchmarked" },
  { value: 29, suffix: "/29", label: "data-quality checks passing" },
  { value: 0.807, decimals: 3, label: "churn model ROC-AUC" },
];

const words = ["decisions", "dashboards", "forecasts", "answers", "insights"];

export function Hero() {
  const { setPaletteOpen } = useUI();

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <ParticleField />
      <div
        className="pointer-events-none absolute -top-40 -right-40 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(var(--glow)/0.14),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-60 -left-40 size-[560px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-3)_16%,transparent),transparent_65%)]"
        aria-hidden="true"
      />

      <motion.div
        className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20 md:px-8"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
      >
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Open to internships &amp; entry-level roles
          </span>
        </motion.div>

        <motion.p variants={item} className="mt-8 font-mono text-accent">
          Hi, my name is
        </motion.p>
        <motion.h1
          variants={item}
          className="mt-3 font-display text-[clamp(2.9rem,9vw,6.5rem)] leading-[0.95] font-bold tracking-tight"
        >
          <span className="text-gradient">Vaibhav Sharma.</span>
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-5 max-w-4xl font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-tight font-semibold text-muted"
        >
          I turn data into{" "}
          <TextScramble words={words} className="font-mono font-semibold text-accent" /> and build the backends behind
          them.
        </motion.p>
        <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          I work across the full data-to-product pipeline: SQL analytics layers, BI dashboards, machine-learning
          models, retrieval (RAG) evaluation and production-minded REST APIs.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic>
            <a
              href="#projects"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent px-6 py-3.5 font-semibold text-accent-ink shadow-[0_8px_30px_-6px_rgb(var(--glow)/0.55)] transition-shadow hover:shadow-[0_12px_40px_-6px_rgb(var(--glow)/0.75)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              View my work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-6 py-3.5 font-semibold text-heading transition-colors hover:border-accent hover:text-accent"
            >
              Get in touch
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-heading md:inline-flex"
          >
            or press
            <kbd className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-heading">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
            to explore
          </button>
        </motion.div>

        <motion.dl variants={item} className="mt-16 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-l-2 border-line-strong pl-4">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-mono text-3xl font-semibold text-heading md:text-4xl">
                <span className="text-accent">
                  <Counter value={s.value} decimals={s.decimals} />
                </span>
                {s.suffix}
              </dd>
              <dd className="mt-1 text-sm text-muted">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-muted md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.6 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
      >
        <ChevronDown className="size-6" />
      </motion.a>
    </section>
  );
}

const techRows = [
  ["PostgreSQL", "Python", "Power BI", "DAX", "Spring Boot", "Java 17", "scikit-learn", "XGBoost", "Prophet", "Streamlit"],
  ["ChromaDB", "BM25", "RAG", "pandas", "JWT", "REST APIs", "Docker", "SQLite", "Plotly", "LangChain"],
];

export function Marquee() {
  return (
    <div className="group relative overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      {techRows.map((row, i) => (
        <div key={i} className={`flex w-max gap-10 ${i ? "mt-4" : ""} ${i ? "animate-marquee-reverse" : "animate-marquee"}`}>
          {[...row, ...row].map((tech, j) => (
            <span
              key={j}
              aria-hidden={j >= row.length ? "true" : undefined}
              className="flex items-center gap-10 font-mono text-sm whitespace-nowrap text-muted"
            >
              {tech}
              <span className="text-[8px] text-accent">◆</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
