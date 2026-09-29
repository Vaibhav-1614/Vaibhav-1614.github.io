# Portfolio: Vaibhav Sharma

Personal portfolio showcasing RAG evaluation, business intelligence, machine learning and backend
engineering projects. Live at **https://vaibhav-1614.github.io**.

Built with **React 19, TypeScript, Tailwind CSS v4 and Motion**, bundled by Vite and deployed to
GitHub Pages by GitHub Actions.

## Features

- **Project dialogs**: each card morphs into a full case study (plain-English summary, problem →
  approach → results, screenshot gallery with swipe and lightbox, engineering decisions, skills).
  Every project has a shareable URL, e.g. `/#project/rag`.
- **Interactive RAG benchmark chart**: bars re-rank when you switch metric, with tooltips and a table view.
- **Command palette** (`⌘K` / `Ctrl K`), **interactive terminal** (type `help`), light/dark theme with
  a circular reveal, magnetic buttons, cursor spotlight cards, a particle-network hero, scroll
  progress, and live "last updated" data from the GitHub API.
- Keyboard accessible, and all motion respects `prefers-reduced-motion`.

## Structure

- `src/data/projects.ts`: all project content (text, metrics, screenshot captions). **Edit this to update projects.**
- `src/data/rag.ts`: RAG benchmark numbers for the chart
- `src/components/`: UI sections and effects
- `public/projects/<slug>/`: screenshots as WebP (full size plus `-thumb`)
- `scripts/optimize-images.mjs`: converts raw PNG screenshots to WebP

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
```

## Adding screenshots

```bash
node scripts/optimize-images.mjs "path/to/png-folder" <slug>
```

Then list the new files (without extension) in that project's `screenshots` array in `src/data/projects.ts`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
