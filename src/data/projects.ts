export type Category = "ai" | "analytics" | "backend";

export type Metric = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export type Screenshot = { file: string; caption: string };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  categories: Category[];
  tagline: string;
  repo: string;
  demo?: string;
  cover: string;
  metrics: Metric[];
  plainEnglish: string;
  problem: string;
  approach: string[];
  results: string[];
  highlights: { title: string; body: string }[];
  skills: string[];
  stack: string[];
  screenshots: Screenshot[];
};

export const GITHUB_USER = "Vaibhav-1614";
export const EMAIL = "vaibhavworks15@gmail.com";

export const categoryLabels: Record<Category | "all", string> = {
  all: "All",
  ai: "AI & ML",
  analytics: "Analytics & BI",
  backend: "Backend",
};

export const projects: Project[] = [
  {
    slug: "rag",
    title: "RAG Evaluation Platform",
    kicker: "AI · Retrieval · Evaluation",
    categories: ["ai", "analytics"],
    tagline:
      "Benchmarked 18 retrieval setups for question-answering over SEC 10-K filings, and showed that plain keyword search beats embeddings on this data.",
    repo: "rag-eval-platform",
    demo: "https://vaibhav-1614-rag-eval-platform-dashboardapp-k5zaiu.streamlit.app",
    cover: "01_benchmark_overview",
    metrics: [
      { value: 18, label: "retrieval configurations benchmarked" },
      { value: 98, suffix: "%", label: "Hit@5 for the best configuration" },
      { value: 6, suffix: " ms", label: "per query for the winning setup" },
      { value: 0, prefix: "$", label: "running cost (local models, no paid APIs)" },
    ],
    plainEnglish:
      "AI assistants that answer questions from documents (\"RAG\") are only as good as the passages they find. I built a test bench that measures which search method actually finds the right passage in company annual reports, so the choice is made on evidence rather than hype.",
    problem:
      "Teams building document Q&A often default to vector (embedding) search without measuring whether it finds the right text. Annual reports are full of exact product names, rule numbers and subsidiaries, which is exactly where that assumption can fail.",
    approach: [
      "Pulled the latest 10-K filing for 10 large-cap companies from the SEC EDGAR API (rate-limited, with exponential backoff).",
      "Parsed and cleaned 4.4M characters of text, stripping the hidden XBRL metadata that makes up 6–19% of each filing.",
      "Split filings into 256, 512 and 1,024-token chunks and indexed them three ways: dense (ChromaDB with MiniLM and BGE embeddings), sparse (BM25) and hybrid (Reciprocal Rank Fusion).",
      "Wrote a 50-question test set with verbatim ground-truth answers and scored every configuration on Hit@5, MRR, nDCG, precision and recall, stored in SQLite.",
      "Shipped a live 3-page Streamlit dashboard: benchmark results, live querying and a dataset explorer.",
    ],
    results: [
      "BM25 keyword search won clearly: 0.97 average Hit@5 vs 0.83 for hybrid and 0.62 for dense retrieval.",
      "Hybrid fusion recovered +21 points over dense-only, but blending in the weaker ranking pushed some correct keyword hits down.",
      "Smaller chunks (256/512 tokens) ranked better in every strategy; 1,024-token chunks diluted the relevant passage.",
      "BGE-small beat MiniLM in all 6 like-for-like pairings.",
      "Recommended setup: BM25 with 256-token chunks. 98% Hit@5 at 6 ms per query, for $0.",
    ],
    highlights: [
      {
        title: "A fair test, by design",
        body: "Questions were written as natural paraphrases, never copying the source sentence, so keyword search gets no unfair verbatim-match advantage.",
      },
      {
        title: "Chunk-size-agnostic relevance",
        body: "A retrieved chunk counts as relevant when its content-word F1 overlap with the gold passage is ≥ 0.35. Random chunk pairs clear that only ~1–3% of the time; true matches score ~0.7.",
      },
      {
        title: "60 vector collections, one command",
        body: "One ChromaDB collection per company × chunk size × embedding model, with cached embeddings so re-runs are fast.",
      },
    ],
    skills: ["Evaluation design", "Information retrieval", "Data engineering", "Experiment analysis", "Dashboarding", "Clear written findings"],
    stack: ["Python", "ChromaDB", "BM25", "sentence-transformers", "LangChain", "SQLite", "Streamlit", "SEC EDGAR API"],
    screenshots: [
      { file: "01_benchmark_overview", caption: "Benchmark results: best configuration, headline metrics and the full config leaderboard." },
      { file: "02_hit_rate_heatmap", caption: "Strategy × chunk-size heatmap for Hit Rate@5. BM25 dominates every row." },
      { file: "03_metric_breakdown_latency", caption: "Metric breakdown by strategy, plus the latency-vs-quality trade-off." },
      { file: "04_all_configurations", caption: "Every configuration side by side across all five retrieval metrics." },
      { file: "05_live_query", caption: "Live Query: ask any question against a company's 10-K with any retrieval setup." },
      { file: "06_dataset_explorer", caption: "Dataset Explorer: 10 filings, 4.4M characters, 9,644 indexed chunks." },
      { file: "07_evaluation_test_set", caption: "The 50-question evaluation set with verbatim ground-truth answers." },
    ],
  },
  {
    slug: "adventureworks",
    title: "AdventureWorks BI Platform",
    kicker: "Business Intelligence",
    categories: ["analytics"],
    tagline:
      "Turned a raw sales database into a validated analytics layer and a five-page executive dashboard covering $109.8M in revenue.",
    repo: "adventureworks-bi",
    cover: "01_executive_summary",
    metrics: [
      { value: 109.8, prefix: "$", suffix: "M", decimals: 1, label: "revenue modelled and reported" },
      { value: 29, suffix: "/29", label: "automated data-quality checks passing" },
      { value: 8, label: "reusable analytical SQL views" },
      { value: 8, suffix: " s", label: "full rebuild, down from 3+ minutes" },
    ],
    plainEnglish:
      "Leadership wants to know where revenue comes from, who is hitting quota and which customers matter most. I turned a company's raw transactional database into trustworthy dashboards that answer those questions, and built checks that prove the numbers are right.",
    problem:
      "Operational (OLTP) databases are built to record sales, not to analyse them. Reporting straight off them gives slow, inconsistent and sometimes silently wrong numbers.",
    approach: [
      "Loaded the AdventureWorks extract into PostgreSQL 16 and added primary keys and join indexes.",
      "Modelled 8 analytical views (KPIs, sales vs quota, product margin, customer RFM, anomalies) using CTEs, window functions and LATERAL joins.",
      "Wrote a SQL validation suite covering completeness, null rates, revenue sanity, date ranges and duplicate keys: 29/29 checks passing.",
      "Built a five-page Streamlit + Plotly dashboard, plus the full Power BI semantic model, DAX measures and page specs.",
      "Documented business insights and recommended actions for stakeholders.",
    ],
    results: [
      "Champions, 13% of customers, generate 69% of customer revenue.",
      "Overall quota attainment is 87%, with per-rep and per-territory rankings.",
      "Bikes run at about a 5% gross margin while accessories run above 50%, a clear pricing and bundling lever.",
      "Z-score anomaly report flags unusual KPI swings in the last three complete months.",
    ],
    highlights: [
      {
        title: "Caught silent logic bugs, not just bad data",
        body: "Found that the RFM recency score was inverted (\"Champions\" hadn't ordered in 660+ days) and that quota attainment was understated about 3× because quarterly quotas were compared against monthly revenue.",
      },
      {
        title: "Correct time anchoring",
        body: "Metrics are anchored to the last order date, not today's date, so a historical snapshot still produces real \"new customer\" and tenure buckets. A partial final month is flagged instead of showing as a −97% collapse.",
      },
      {
        title: "Secure, fast and reproducible",
        body: "A read-only reporting role for Power BI, with the password supplied at runtime and never committed. Rebuild plus validation went from over 3 minutes to about 8 seconds.",
      },
    ],
    skills: ["SQL modelling", "KPI design", "Data validation", "Stakeholder reporting", "Root-cause debugging", "Performance tuning"],
    stack: ["PostgreSQL 16", "SQL", "Power BI", "DAX", "Streamlit", "Plotly"],
    screenshots: [
      { file: "01_executive_summary", caption: "Executive summary: revenue by channel, quarterly revenue and average order value trend." },
      { file: "02_sales_performance", caption: "Sales performance: quota attainment by salesperson and revenue by territory." },
      { file: "03_product_intelligence", caption: "Product intelligence: revenue and margin treemap, top products and category trends." },
      { file: "04_customer_analytics", caption: "Customer analytics: RFM segments, lifetime value, new vs returning customers." },
      { file: "05_anomaly_report", caption: "Anomaly report: z-score outliers for the last three complete months." },
    ],
  },
  {
    slug: "ecommerce",
    title: "E-Commerce Analytics Dashboard",
    kicker: "Analytics · Forecasting · Churn",
    categories: ["analytics", "ai"],
    tagline:
      "End-to-end analytics on 1M+ real invoice lines: data warehouse, customer segmentation, revenue forecasting and a churn model.",
    repo: "ecommerce-analytics-dashboard",
    cover: "01_overview",
    metrics: [
      { value: 16.76, prefix: "£", suffix: "M", decimals: 2, label: "net revenue, after cleaning" },
      { value: 1.07, suffix: "M", decimals: 2, label: "invoice lines processed" },
      { value: 0.807, decimals: 3, label: "churn model ROC-AUC (5-fold CV)" },
      { value: 37.8, suffix: "%", decimals: 1, label: "average monthly retention" },
    ],
    plainEnglish:
      "An online retailer wants to know how the business is doing, who its best customers are, what next quarter looks like and who is about to stop buying. This project answers all four from two years of real sales data, in one dashboard.",
    problem:
      "The raw UCI Online Retail II data looks clean but isn't: overlapping sheets, duplicate lines, cancelled orders and non-product charges quietly inflate revenue and distort every downstream metric.",
    approach: [
      "Built a PostgreSQL warehouse (customers, products, invoices, line items) with a seed pipeline that cleans and de-duplicates the source.",
      "Computed KPIs: revenue, orders, AOV, retention, cancellations and top products.",
      "Segmented 5,860 customers with RFM and projected 12-month customer lifetime value.",
      "Forecast revenue with Prophet against an ARIMA baseline.",
      "Trained and compared 3 churn models (Logistic Regression, Random Forest, XGBoost) on leakage-safe features, with live scoring in the dashboard.",
    ],
    results: [
      "£16.76M net revenue across 36,664 orders at a £457 average order value.",
      "Champions make up 22% of customers; average monthly retention is 37.8%.",
      "Best churn model reaches 0.807 ROC-AUC; the top driver is days since last order.",
      "Forecast respects real trading patterns (the shop never trades on Saturdays) and is compared with the same season a year earlier.",
    ],
    highlights: [
      {
        title: "Revenue you can trust",
        body: "Dropped 34,335 duplicate rows (about 2% of revenue would have been double-counted) and removed 6,092 purchase lines, £613k, that were exactly reversed by later cancellations.",
      },
      {
        title: "Leakage-safe churn labels",
        body: "A customer is churned if they don't buy in the 90 days after a cutoff, and every feature uses only data from before that cutoff, so the model can't peek at the answer.",
      },
      {
        title: "Honest feature importance",
        body: "Used permutation importance on held-out data, so the result is comparable across models and not inflated by rare one-hot country columns.",
      },
    ],
    skills: ["Data cleaning", "Customer segmentation", "Forecasting", "Classification modelling", "Leakage prevention", "Dashboard UX"],
    stack: ["Python", "PostgreSQL", "pandas", "scikit-learn", "XGBoost", "Prophet", "ARIMA", "Streamlit"],
    screenshots: [
      { file: "01_overview", caption: "Overview: revenue, orders, AOV, cancellations and retention, with monthly revenue and top markets." },
      { file: "02_customer_intelligence", caption: "Customer intelligence: RFM segments and projected customer lifetime value." },
      { file: "03_forecasting", caption: "Forecasting: Prophet revenue forecast compared against an ARIMA baseline." },
      { file: "04_churn_prediction", caption: "Churn prediction: model comparison, feature importance and live customer scoring." },
    ],
  },
  {
    slug: "multitenant",
    title: "Multi-Tenant REST API",
    kicker: "Backend Engineering",
    categories: ["backend"],
    tagline:
      "A production-minded Spring Boot API where many companies share one system but can never see each other's data.",
    repo: "multitenant-api",
    cover: "03_cross_tenant_access_blocked",
    metrics: [
      { value: 12, label: "integration tests, including cross-tenant attacks" },
      { value: 7, label: "error types with one consistent JSON shape" },
      { value: 2, label: "rate-limit scopes (per tenant, per IP)" },
      { value: 404, label: "returned for any other tenant's data" },
    ],
    plainEnglish:
      "Software-as-a-service products put many customer companies (\"tenants\") in one system. The worst possible bug is one company seeing another's data. This API makes that structurally impossible and proves it with tests.",
    problem:
      "Multi-tenant APIs commonly take the tenant ID from the URL or request body, so one altered request can leak another customer's data. They also often return inconsistent errors that make client integration painful.",
    approach: [
      "Resolved tenant identity only from signed JWT claims, never from the URL or body.",
      "Self-service sign-up creates a new tenant and makes the caller its first ADMIN; extra fields like tenantId or role are ignored.",
      "Role-based access with Spring Security method security (@PreAuthorize) for admin-only endpoints.",
      "Per-tenant and per-IP rate limiting with Bucket4j.",
      "A global exception handler so every failure, even inside security filters, returns the same ApiError JSON.",
    ],
    results: [
      "Requesting another tenant's project returns 404, so the API doesn't even reveal that it exists.",
      "12 MockMvc integration tests cover sign-up, login, validation, 401/403 handling, admin endpoints, CRUD and cross-tenant read/update/delete.",
      "Swagger-first developer experience: open the root URL, authorise and try every endpoint.",
      "Runs with one command via Docker Compose.",
    ],
    highlights: [
      {
        title: "Isolation enforced at the boundary",
        body: "Tenant context comes from the token and is applied to every query automatically, so a developer can't accidentally forget to filter by tenant.",
      },
      {
        title: "Errors designed for clients",
        body: "400, 401, 403, 404, 409, 429 and 500 all share one ApiError shape. Unexpected errors are logged server-side and never leak internals.",
      },
      {
        title: "Secure by default",
        body: "BCrypt password hashing, an overridable 256-bit JWT secret, and paginated, sortable endpoints with validated sort fields.",
      },
    ],
    skills: ["API design", "Security & auth", "Multi-tenancy", "Automated testing", "Error handling", "Developer experience"],
    stack: ["Java 17", "Spring Boot", "Spring Security", "JWT", "JPA / Hibernate", "PostgreSQL", "Bucket4j", "OpenAPI", "Docker"],
    screenshots: [
      { file: "03_cross_tenant_access_blocked", caption: "Isolation in action: requesting another tenant's project returns 404 Project not found." },
      { file: "02_tenant_scoped_projects", caption: "Tenant-scoped, paginated project listing via Swagger UI." },
      { file: "04_admin_tenant_members", caption: "Admin-only endpoint: listing members of the caller's tenant." },
      { file: "01_swagger_overview", caption: "OpenAPI / Swagger overview of every endpoint." },
    ],
  },
  {
    slug: "bike-sharing",
    title: "Bike Sharing Demand Analysis",
    kicker: "Analytics · Machine Learning",
    categories: ["analytics", "ai"],
    tagline:
      "Predicts hourly bike-rental demand from weather, season and time of day. R² 0.90 on a strict time-based hold-out.",
    repo: "Bike_Sharing_Analysis",
    cover: "06_demand_driver_dashboard",
    metrics: [
      { value: 17377, label: "hourly observations analysed" },
      { value: 0.951, decimals: 3, label: "R² on a random 80/20 split" },
      { value: 0.903, decimals: 3, label: "R² on a chronological hold-out" },
      { value: 6, label: "new engineered features" },
    ],
    plainEnglish:
      "Bike-share operators need to know how many bikes will be wanted, and when, to put them in the right place. This project finds what drives demand and predicts it hour by hour.",
    problem:
      "Demand swings with hour, season and weather, and naive evaluation (random splits) makes forecasting models look better than they really are on future data.",
    approach: [
      "Cleaned and feature-engineered 17,377 hourly records (peak period, rush hour, part of day), flagging outliers instead of deleting real demand peaks.",
      "Designed a star-schema fact table in SQLite, with views standing in for partitions and materialised views.",
      "Ran OLAP-style analysis: season × weather cubes and a year → season → part-of-day ROLLUP.",
      "Used window functions for 7- and 30-day rolling averages, volatility and LAG/LEAD deltas, each with its PostgreSQL equivalent.",
      "Compared Random Forest vs Gradient Boosted Trees with 5-fold CV and a chronological hold-out.",
    ],
    results: [
      "Gradient Boosted Trees: R² 0.951 (RMSE 38.6 rentals/hour) on a random split.",
      "R² 0.903 on the stricter chronological test (train before Sep 2012, test Sep–Dec 2012), the number to quote for forecasting.",
      "Top demand drivers: hour of day, working day / rush hour, year and temperature.",
      "Rush hour lifts demand in every season, and rain cuts rentals by about 45% compared with clear weather.",
    ],
    highlights: [
      {
        title: "Evaluation that matches reality",
        body: "Reported both a random split and a chronological hold-out, and explained why the time-based score is the honest one for forecasting.",
      },
      {
        title: "Database concepts, applied",
        body: "Indexing and query-timing benchmarks, OLAP cubes via UNION ALL, and window-function patterns, with PostgreSQL equivalents documented.",
      },
      {
        title: "Fully reproducible",
        body: "The notebook is committed with outputs so every chart renders on GitHub, and re-runs end to end in 2–4 minutes.",
      },
    ],
    skills: ["Feature engineering", "Regression modelling", "OLAP analysis", "Window functions", "Model evaluation", "Data storytelling"],
    stack: ["Python", "pandas", "scikit-learn", "SQLite", "SQL", "matplotlib", "seaborn", "Jupyter"],
    screenshots: [
      { file: "06_demand_driver_dashboard", caption: "Demand-driver summary: correlations, temperature and weather effects, rush-hour lift and the KPI summary." },
      { file: "02_hourly_demand_patterns", caption: "Hourly demand patterns across the day." },
      { file: "01_seasonal_demand", caption: "Seasonal demand across the two years." },
      { file: "03_weather_impact", caption: "How weather conditions shift rentals." },
      { file: "04_olap_cube", caption: "OLAP cube: season × weather and season × part of day." },
      { file: "05_rolling_aggregates", caption: "Rolling 7- and 30-day averages and volatility via window functions." },
      { file: "07_gbt_model_evaluation", caption: "Gradient Boosted Trees model evaluation." },
      { file: "08_feature_importance", caption: "Feature importance: what the model relies on most." },
    ],
  },
];

export const imagePath = (slug: string, file: string, thumb = false) =>
  `${import.meta.env.BASE_URL}projects/${slug}/${file}${thumb ? "-thumb" : ""}.webp`;
