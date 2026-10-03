const techRows = [
  ["PostgreSQL", "Python", "Power BI", "DAX", "Spring Boot", "Java 17", "scikit-learn", "XGBoost", "Prophet", "Streamlit"],
  ["ChromaDB", "BM25", "RAG", "pandas", "JWT", "REST APIs", "Docker", "SQLite", "Plotly", "LangChain"],
];

function Asterisk({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 66 62" className={className} aria-hidden="true" stroke="currentColor" strokeWidth="6" strokeLinecap="square">
      <line x1="33" y1="1" x2="33" y2="61" />
      <line x1="3" y1="31" x2="63" y2="31" />
      <line x1="11.8" y1="9.8" x2="54.2" y2="52.2" />
      <line x1="54.2" y1="9.8" x2="11.8" y2="52.2" />
    </svg>
  );
}

/** Two counter-scrolling rows of the stack: serif on top, mono below. Pauses on hover. */
export function Marquee() {
  return (
    <div
      className="group relative overflow-hidden border-y border-line py-7 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
      aria-label={`Technologies: ${techRows.flat().join(", ")}`}
      role="img"
    >
      {techRows.map((row, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`flex w-max items-center ${i ? "animate-marquee-reverse mt-4 gap-8" : "animate-marquee gap-12"}`}
        >
          {[...row, ...row].map((tech, j) => (
            <span
              key={j}
              className={`flex items-center whitespace-nowrap ${
                i ? "gap-8 font-mono text-sm text-muted" : "gap-12 font-display text-4xl text-heading md:text-5xl"
              }`}
            >
              {tech}
              <Asterisk className={i ? "size-2.5 text-accent" : "size-4 text-accent"} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
