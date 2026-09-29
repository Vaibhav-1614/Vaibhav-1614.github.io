import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { BarChart3, Table2 } from "lucide-react";
import { ragMetrics, ragRows, strategyLabels, type MetricKey, type RagRow, type Strategy } from "../data/rag";

const strategies: Strategy[] = ["sparse", "hybrid", "dense"];
const seriesVar: Record<Strategy, string> = {
  sparse: "var(--series-sparse)",
  hybrid: "var(--series-hybrid)",
  dense: "var(--series-dense)",
};

const fmt = (key: MetricKey, v: number) => (key === "latency" ? `${v} ms` : v.toFixed(key === "hit5" ? 2 : 3));
const rowId = (r: RagRow) => `${r.strategy}-${r.chunk}-${r.embedding}`;
const rowLabel = (r: RagRow) => `${r.strategy} · ${r.chunk} · ${r.embedding}`;

export function RagChart() {
  const [metric, setMetric] = useState<MetricKey>("hit5");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [hovered, setHovered] = useState<string | null>(null);
  const meta = ragMetrics.find((m) => m.key === metric)!;

  const sorted = useMemo(
    () => [...ragRows].sort((a, b) => (meta.lowerIsBetter ? a[metric] - b[metric] : b[metric] - a[metric])),
    [metric, meta.lowerIsBetter],
  );
  const max = metric === "latency" ? 32 : 1;

  const averages = strategies.map((s) => {
    const rows = ragRows.filter((r) => r.strategy === s);
    return { s, avg: rows.reduce((t, r) => t + r[metric], 0) / rows.length };
  });

  return (
    <div className="rounded-2xl border border-line bg-bg/60 p-4 md:p-6">
      {/* Controls: one row above the chart */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Metric">
          <LayoutGroup id="rag-metric">
            {ragMetrics.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={metric === m.key}
                onClick={() => setMetric(m.key)}
                className={`relative rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                  metric === m.key ? "text-heading" : "text-muted hover:text-heading"
                }`}
              >
                {metric === m.key && (
                  <motion.span layoutId="rag-metric-pill" className="absolute inset-0 -z-0 rounded-lg bg-accent/15 ring-1 ring-accent/40" />
                )}
                <span className="relative">{m.label}</span>
              </button>
            ))}
          </LayoutGroup>
        </div>
        <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
          {(
            [
              ["chart", BarChart3, "Chart"],
              ["table", Table2, "Table"],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                view === v ? "bg-accent/15 text-heading" : "text-muted hover:text-heading"
              }`}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">{meta.hint}</p>

      {/* Headline: strategy averages for the selected metric */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {averages.map(({ s, avg }) => (
          <div key={s} className="rounded-xl border border-line bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: seriesVar[s] }} />
              <span className="truncate">{strategyLabels[s]}</span>
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-heading tabular-nums">
              {metric === "latency" ? `${avg.toFixed(0)} ms` : avg.toFixed(2)}
            </div>
            <div className="text-[11px] text-muted">average</div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "chart" ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5"
            role="list"
            aria-label={`Configurations ranked by ${meta.label}`}
          >
            {sorted.map((r, i) => {
              const id = rowId(r);
              const isHover = hovered === id;
              const pct = (r[metric] / max) * 84; // leave room for the value label
              return (
                <motion.div
                  layout
                  key={id}
                  role="listitem"
                  tabIndex={0}
                  onPointerEnter={() => setHovered(id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(id)}
                  onBlur={() => setHovered(null)}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  className="relative grid grid-cols-[7.5rem_1fr] items-center gap-3 py-[3px] outline-none sm:grid-cols-[12.5rem_1fr]"
                  aria-label={`${rowLabel(r)}: ${meta.label} ${fmt(metric, r[metric])}`}
                >
                  <span className={`truncate text-right font-mono text-[11px] ${isHover ? "text-heading" : "text-muted"}`}>
                    <span className="sm:hidden">
                      {r.chunk} · {r.embedding}
                    </span>
                    <span className="hidden sm:inline">{rowLabel(r)}</span>
                  </span>
                  <div className="relative h-5">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-r-[4px]"
                      style={{ background: seriesVar[r.strategy] }}
                      initial={false}
                      animate={{ width: `${pct}%`, opacity: hovered && !isHover ? 0.45 : 1 }}
                      transition={{ type: "spring", stiffness: 140, damping: 22, delay: i * 0.012 }}
                    />
                    <motion.span
                      className="absolute inset-y-0 flex items-center pl-2 font-mono text-[11px] text-heading tabular-nums"
                      initial={false}
                      animate={{ left: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 140, damping: 22, delay: i * 0.012 }}
                    >
                      {fmt(metric, r[metric])}
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {isHover && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="pointer-events-none absolute right-0 bottom-full z-20 mb-1 w-56 rounded-lg border border-line bg-surface p-3 shadow-xl"
                      >
                        <div className="font-mono text-base font-semibold text-heading">{fmt(metric, r[metric])}</div>
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                          <span className="h-0.5 w-3" style={{ background: seriesVar[r.strategy] }} />
                          {rowLabel(r)}
                        </div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                          {ragMetrics
                            .filter((m) => m.key !== metric)
                            .map((m) => (
                              <div key={m.key} className="contents">
                                <dt className="text-muted">{m.label}</dt>
                                <dd className="text-right text-heading">{fmt(m.key, r[m.key])}</dd>
                              </div>
                            ))}
                        </dl>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Legend (identity is never color-alone: labels + legend + table) */}
            <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-xs text-muted">
              {strategies.map((s) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: seriesVar[s] }} />
                  {strategyLabels[s]}
                </span>
              ))}
              <span className="ml-auto">Hover or tab through bars for every metric</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left font-mono text-xs">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-3 font-medium">Strategy</th>
                  <th className="py-2 pr-3 font-medium">Chunk</th>
                  <th className="py-2 pr-3 font-medium">Embedding</th>
                  {ragMetrics.map((m) => (
                    <th key={m.key} className={`py-2 pr-3 text-right font-medium ${m.key === metric ? "text-accent" : ""}`}>
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={rowId(r)} className="border-b border-line/60 text-heading">
                    <td className="py-1.5 pr-3">
                      <span className="mr-2 inline-block h-2 w-2 rounded-sm" style={{ background: seriesVar[r.strategy] }} />
                      {r.strategy}
                    </td>
                    <td className="py-1.5 pr-3">{r.chunk}</td>
                    <td className="py-1.5 pr-3">{r.embedding}</td>
                    {ragMetrics.map((m) => (
                      <td key={m.key} className="py-1.5 pr-3 text-right tabular-nums">
                        {fmt(m.key, r[m.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
