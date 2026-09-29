// Benchmark results from github.com/Vaibhav-1614/rag-eval-platform (README, eval v2).
// 50 questions × 10 filings, top-5 retrieval. BM25 rows are embedding-independent.

export type Strategy = "sparse" | "hybrid" | "dense";

export type RagRow = {
  strategy: Strategy;
  chunk: 256 | 512 | 1024;
  embedding: "BM25" | "BGE-small" | "MiniLM";
  hit5: number;
  mrr: number;
  ndcg5: number;
  precision: number;
  recall: number;
  latency: number;
};

export const ragRows: RagRow[] = [
  { strategy: "sparse", chunk: 256, embedding: "BM25", hit5: 0.98, mrr: 0.846, ndcg5: 0.87, precision: 0.308, recall: 0.986, latency: 6 },
  { strategy: "sparse", chunk: 512, embedding: "BM25", hit5: 0.98, mrr: 0.785, ndcg5: 0.833, precision: 0.3, recall: 0.984, latency: 5 },
  { strategy: "sparse", chunk: 1024, embedding: "BM25", hit5: 0.96, mrr: 0.762, ndcg5: 0.801, precision: 0.252, recall: 0.972, latency: 3 },
  { strategy: "hybrid", chunk: 256, embedding: "BGE-small", hit5: 0.9, mrr: 0.751, ndcg5: 0.781, precision: 0.268, recall: 0.919, latency: 30 },
  { strategy: "hybrid", chunk: 512, embedding: "BGE-small", hit5: 0.88, mrr: 0.768, ndcg5: 0.779, precision: 0.264, recall: 0.907, latency: 25 },
  { strategy: "hybrid", chunk: 256, embedding: "MiniLM", hit5: 0.88, mrr: 0.711, ndcg5: 0.745, precision: 0.268, recall: 0.908, latency: 30 },
  { strategy: "hybrid", chunk: 1024, embedding: "BGE-small", hit5: 0.82, mrr: 0.65, ndcg5: 0.69, precision: 0.204, recall: 0.866, latency: 26 },
  { strategy: "hybrid", chunk: 512, embedding: "MiniLM", hit5: 0.76, mrr: 0.633, ndcg5: 0.652, precision: 0.232, recall: 0.818, latency: 25 },
  { strategy: "hybrid", chunk: 1024, embedding: "MiniLM", hit5: 0.74, mrr: 0.543, ndcg5: 0.586, precision: 0.192, recall: 0.805, latency: 20 },
  { strategy: "dense", chunk: 256, embedding: "BGE-small", hit5: 0.66, mrr: 0.548, ndcg5: 0.572, precision: 0.196, recall: 0.732, latency: 14 },
  { strategy: "dense", chunk: 512, embedding: "BGE-small", hit5: 0.68, mrr: 0.512, ndcg5: 0.549, precision: 0.184, recall: 0.753, latency: 14 },
  { strategy: "dense", chunk: 256, embedding: "MiniLM", hit5: 0.66, mrr: 0.524, ndcg5: 0.55, precision: 0.188, recall: 0.736, latency: 13 },
  { strategy: "dense", chunk: 1024, embedding: "BGE-small", hit5: 0.64, mrr: 0.456, ndcg5: 0.496, precision: 0.156, recall: 0.711, latency: 13 },
  { strategy: "dense", chunk: 512, embedding: "MiniLM", hit5: 0.62, mrr: 0.387, ndcg5: 0.444, precision: 0.176, recall: 0.706, latency: 13 },
  { strategy: "dense", chunk: 1024, embedding: "MiniLM", hit5: 0.46, mrr: 0.352, ndcg5: 0.38, precision: 0.12, recall: 0.58, latency: 14 },
];

export type MetricKey = "hit5" | "mrr" | "ndcg5" | "recall" | "latency";

export const ragMetrics: { key: MetricKey; label: string; hint: string; lowerIsBetter?: boolean }[] = [
  { key: "hit5", label: "Hit@5", hint: "Share of questions where the right passage appears in the top 5 results." },
  { key: "mrr", label: "MRR", hint: "How high the first correct passage ranks (1.0 = always first)." },
  { key: "ndcg5", label: "nDCG@5", hint: "Ranking quality of the top 5, rewarding correct passages near the top." },
  { key: "recall", label: "Recall", hint: "Share of the answer's content covered by the retrieved passages." },
  { key: "latency", label: "Latency", hint: "Milliseconds per query on a laptop CPU. Lower is better.", lowerIsBetter: true },
];

export const strategyLabels: Record<Strategy, string> = {
  sparse: "Sparse · BM25",
  hybrid: "Hybrid · RRF",
  dense: "Dense · embeddings",
};
