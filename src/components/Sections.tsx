import { useRef, type MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { BarChart3, Brain, Copy, Database, Mail, Search, Server } from "lucide-react";
import { EMAIL, GITHUB_USER } from "../data/projects";
import { copyText, useUI } from "../hooks/ui";
import { Terminal } from "./Terminal";
import { GitHubIcon, Magnetic, Reveal, SectionHeading, trackSpotlight } from "./primitives";

/* ---------- About ---------- */
export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading index="01" title="About" />
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="space-y-5 text-lg leading-relaxed text-muted">
          <p>
            I'm a developer focused on <strong className="text-heading">data analytics</strong>,{" "}
            <strong className="text-heading">applied AI</strong> and{" "}
            <strong className="text-heading">backend engineering</strong>. My projects cover the full lifecycle: modelling raw
            transactional data into validated analytics layers, building BI dashboards, training forecasting and churn models,
            benchmarking retrieval for RAG systems, and shipping secure multi-tenant APIs.
          </p>
          <p>
            I care about the details that make work production-ready: automated data-quality checks, leakage-safe ML labels,
            fair evaluation design, tenant isolation enforced at the API boundary, and write-ups that stakeholders can actually
            use.
          </p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 font-mono text-sm">
            {["PostgreSQL & SQL", "Python · pandas · scikit-learn", "RAG · BM25 · ChromaDB", "Power BI & DAX", "Java · Spring Boot", "Streamlit · Plotly"].map(
              (t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-accent">▹</span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Skills (bento with 3D tilt) ---------- */
const skillGroups = [
  {
    title: "Data & Analytics",
    icon: Database,
    blurb: "Warehouse modelling, SQL analytics layers and validation suites that make numbers trustworthy.",
    tags: ["SQL", "PostgreSQL", "OLAP", "Window functions", "Data validation", "RFM segmentation", "KPI design"],
    span: "md:col-span-2",
  },
  {
    title: "AI & Retrieval",
    icon: Search,
    blurb: "Evaluating RAG pipelines on evidence: dense, sparse and hybrid retrieval.",
    tags: ["RAG", "BM25", "ChromaDB", "Embeddings", "RRF", "IR metrics"],
    span: "",
  },
  {
    title: "Machine Learning",
    icon: Brain,
    blurb: "Forecasting and classification with leakage-safe features and honest evaluation.",
    tags: ["scikit-learn", "XGBoost", "Prophet", "ARIMA", "Churn modelling", "Cross-validation"],
    span: "",
  },
  {
    title: "BI & Visualization",
    icon: BarChart3,
    blurb: "Dashboards that answer business questions at a glance.",
    tags: ["Power BI", "DAX", "Semantic models", "Streamlit", "Plotly", "matplotlib"],
    span: "",
  },
  {
    title: "Backend Engineering",
    icon: Server,
    blurb: "Secure, tested REST APIs with consistent contracts.",
    tags: ["Java 17", "Spring Boot", "Spring Security", "JWT", "JPA / Hibernate", "Rate limiting", "OpenAPI"],
    span: "",
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const transform = useMotionTemplate`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    trackSpotlight(e as never);
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(-py * 6);
    ry.set(px * 6);
  };

  return (
    <motion.div
      ref={ref}
      style={{ transform }}
      onMouseMove={onMove}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className={`spotlight rounded-2xl border border-line bg-card p-6 transition-colors hover:bg-card-hover ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading index="02" title="Skills" subtitle="The toolkit behind the projects below. Every tag is something I've shipped with." />
      <div className="grid gap-4 md:grid-cols-3">
        {skillGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.08} className={g.span}>
            <TiltCard className="h-full">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  <g.icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold text-heading">{g.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted">{g.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <span key={t} className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-xs text-accent">
                    {t}
                  </span>
                ))}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
export function Contact() {
  const { toast } = useUI();
  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-5 py-28 text-center md:px-8 md:py-40">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 max-w-3xl -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(var(--glow)/0.14),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <Reveal>
        <p className="font-mono text-sm text-accent">04. What's next?</p>
        <h2 className="mt-4 font-display text-[clamp(2.4rem,7vw,5rem)] leading-none font-bold tracking-tight">
          <span className="text-gradient">Let's build something.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          I'm open to internships, entry-level roles and collaboration on data, AI or backend projects. My inbox is always open.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-12 flex flex-wrap items-center justify-center gap-4">
        <Magnetic intensity={0.5} range={140}>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-4 text-lg font-semibold text-accent-ink shadow-[0_8px_30px_-6px_rgb(var(--glow)/0.6)]"
          >
            <Mail className="size-5" /> Say hello
          </a>
        </Magnetic>
        <Magnetic intensity={0.5} range={120}>
          <button
            type="button"
            onClick={() => copyText(EMAIL).then((ok) => toast(ok ? "Email copied to clipboard" : EMAIL))}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-6 py-4 font-semibold text-heading transition-colors hover:border-accent hover:text-accent"
          >
            <Copy className="size-4" /> Copy email
          </button>
        </Magnetic>
        <Magnetic intensity={0.5} range={120}>
          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-6 py-4 font-semibold text-heading transition-colors hover:border-accent hover:text-accent"
          >
            <GitHubIcon className="size-4" /> GitHub
          </a>
        </Magnetic>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-8 text-center font-mono text-xs text-muted">
      <p>
        Designed &amp; built by Vaibhav Sharma · {new Date().getFullYear()}
      </p>
      <p className="mt-2">
        React · TypeScript · Tailwind CSS · Motion ·{" "}
        <a
          className="text-accent hover:underline"
          href={`https://github.com/${GITHUB_USER}/${GITHUB_USER}.github.io`}
          target="_blank"
          rel="noopener"
        >
          view source
        </a>
      </p>
    </footer>
  );
}
