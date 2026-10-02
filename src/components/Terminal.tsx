import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { EMAIL, GITHUB_USER, projects } from "../data/projects";
import { copyText, useUI } from "../hooks/ui";

type Line = { kind: "in" | "out"; text: ReactNode };

const intro: Line[] = [
  { kind: "in", text: "whoami" },
  { kind: "out", text: "vaibhav-sharma · data analytics · AI retrieval · backend engineering" },
  { kind: "in", text: "cat focus.txt" },
  { kind: "out", text: "analytics · BI · machine learning · RAG evaluation · REST APIs" },
];

const HINT = "Type 'help' and press Enter. Try it!";

export function Terminal() {
  const { openProject, toast } = useUI();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Type out the intro once, when the terminal scrolls into view.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setLines([...intro, { kind: "out", text: HINT }]);
      setReady(true);
      return;
    }
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      for (const line of intro) {
        if (line.kind === "in") {
          const text = String(line.text);
          for (let i = 1; i <= text.length; i++) {
            if (cancelled) return;
            setTyping(text.slice(0, i));
            await sleep(55);
          }
          await sleep(250);
          setTyping("");
        }
        if (cancelled) return;
        setLines((l) => [...l, line]);
        await sleep(line.kind === "out" ? 350 : 80);
      }
      setLines((l) => [...l, { kind: "out", text: HINT }]);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, reduce]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, typing]);

  const run = (raw: string): ReactNode | null => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ").toLowerCase();
    switch (cmd?.toLowerCase()) {
      case "":
        return null;
      case "help":
        return (
          <span className="grid grid-cols-[auto_1fr] gap-x-4">
            {[
              ["whoami", "who I am"],
              ["projects", "list my projects"],
              ["open <name>", "open a project, e.g. open rag"],
              ["skills", "what I work with"],
              ["contact", "how to reach me"],
              ["copy email", "copy my email address"],
              ["github", "open my GitHub"],
              ["clear", "clear the screen"],
            ].map(([c, d]) => (
              <span key={c} className="contents">
                <span className="text-accent">{c}</span>
                <span>{d}</span>
              </span>
            ))}
          </span>
        );
      case "whoami":
        return "Vaibhav Sharma, a developer who builds analytics layers, ML models, RAG evaluations and secure APIs.";
      case "ls":
      case "projects":
        return (
          <span className="grid gap-0.5">
            {projects.map((p) => (
              <button key={p.slug} type="button" className="text-left hover:text-heading" onClick={() => openProject(p.slug)}>
                <span className="whitespace-pre text-accent">{p.slug.padEnd(16, " ")}</span>
                {p.title}
              </button>
            ))}
            <span className="mt-1 opacity-70">→ open &lt;name&gt; for the full story</span>
          </span>
        );
      case "open":
      case "cd": {
        const match = projects.find((p) => p.slug === arg || p.slug.startsWith(arg) || p.title.toLowerCase().includes(arg));
        if (!arg || !match) return `No project matches "${arg}". Try: ${projects.map((p) => p.slug).join(", ")}`;
        setTimeout(() => openProject(match.slug), 250);
        return `Opening ${match.title}…`;
      }
      case "skills":
        return "SQL · PostgreSQL · Python · pandas · scikit-learn · Power BI · DAX · Streamlit · RAG · Java · Spring Boot · JWT";
      case "contact":
      case "email":
        return (
          <span>
            Email <a className="text-accent underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> · or type{" "}
            <span className="text-accent">copy email</span>
          </span>
        );
      case "copy":
        copyText(EMAIL).then((ok) => ok && toast("Email copied to clipboard"));
        return "Copied!";
      case "github":
        window.open(`https://github.com/${GITHUB_USER}`, "_blank", "noopener");
        return `Opening github.com/${GITHUB_USER}…`;
      case "sudo":
        return arg.includes("hire") ? "Permission granted. Let's talk → type 'contact' 🚀" : "Nice try. This incident will be reported.";
      case "date":
        return new Date().toString();
      case "echo":
        return args.join(" ");
      default:
        return `command not found: ${cmd}. Type 'help' for the list.`;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = value;
      setValue("");
      setHistoryIndex(-1);
      if (input.trim()) setHistory((h) => [input, ...h].slice(0, 30));
      if (input.trim().toLowerCase() === "clear") {
        setLines([]);
        return;
      }
      const out = run(input);
      setLines((l) => [...l, { kind: "in", text: input }, ...(out === null ? [] : [{ kind: "out" as const, text: out }])]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (history[next] !== undefined) {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(Math.max(next, -1));
      setValue(next >= 0 ? history[next] : "");
    }
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-muted">vaibhav@portfolio: ~</span>
      </div>
      <div ref={scrollRef} className="h-80 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.kind === "in" ? "text-heading" : "mb-2 text-muted"}>
            {line.kind === "in" && <span className="mr-2 text-accent">$</span>}
            {line.text}
          </div>
        ))}
        {!ready && (
          <div className="text-heading">
            <span className="mr-2 text-accent">$</span>
            {typing}
            <span className="animate-blink text-accent">▊</span>
          </div>
        )}
        {ready && (
          <label className="flex items-center text-heading">
            <span className="mr-2 text-accent">$</span>
            <span className="sr-only">Terminal command</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              placeholder="help"
              className="flex-1 bg-transparent caret-accent outline-none placeholder:text-muted/50"
            />
          </label>
        )}
      </div>
    </div>
  );
}
