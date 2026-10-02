# AI Launch Radar

A small AI-site discovery and comparison workspace for the Semalt hiring test, built with Codex. All production records come from the public, keyless [FreeSERP API](https://freeserp.ai/docs.php).

## What is implemented

- Live, server-rendered discovery using homepage profiles: **`index=sites&ai_startups=1`**.
- Search by Enter or button; no API calls while typing. Fifteen categories, eight technology filters, Domain Rating, date ranges and four sorting modes.
- Shareable URL filters, browser history, pagination with cancellation and domain deduplication.
- Exact-domain details and shareable comparison of 2–3 sites. Selection survives refresh through sessionStorage and can be edited on mobile.
- Returning from a detail or comparison restores the loaded list and scroll position within the same browsing session.
- Optional AI statistics, honest missing-data/empty/error states, retries and safe external links.
- Responsive desktop/tablet/mobile layouts, keyboard controls and signal explanations.

**Site plan:** goal, audience, pages, page blocks and navigation are in [docs/SITE_PLAN.md](docs/SITE_PLAN.md).

## Run locally

Requires **Node.js 24** (`.nvmrc`) and internet access to FreeSERP. No API key, registration, database or environment variables are required.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For production:

```bash
npm run build
npm start
```

The submission is a source archive. Unpack it, open the `ai-launch-radar` directory and run the commands above. A hosted demo is optional and has not been published. This is a Next.js server application; it cannot run as plain static files on GitHub Pages.

## Architecture and API decisions

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod and Lucide. Dependencies are pinned through `package-lock.json`.

- `src/lib/freeserp/`: typed query mapping, upstream schemas, fetching, normalization, safe URLs and pagination.
- `src/app/api/`: validated public parameters and stable success/error responses. Upstream requests have a 10-second timeout, including body download. Search is cached for 30 seconds; statistics for five minutes.
- `src/features/discovery/`: draft search, URL filters and results. Stale requests are cancelled/ignored. Return snapshots use bounded memory: three entries, up to 240 sites each, five-minute lifetime; refresh/direct visits fetch live data.
- `src/features/compare/`: browser-session selection with a three-site limit. Comparison URLs contain domains and work without previous selection.

Default discovery sorts by `went_live` descending with no DR/date floor. Date filters are calculated in UTC at request time. Chatbots send the live-verified `AI Chatbot & Assistant` taxonomy value. Detail lookups use `index=sites&q=<domain>&all=1&size=1` and verify the returned domain. Pagination advances by raw upstream count and respects the 10,000-result limit.

`went_live` means **first confirmed reachable**, not official launch. `first_seen` means **first discovered**. DR is an authority proxy, not product quality; null remains “Not scored” and zero remains zero. Technology is a detected signal, not a verified full stack. The AI niche can contain agencies, portfolios and research sites.

## Verification

```bash
npm test             # 63 unit/component tests; no network required
npm run lint         # zero warnings
npm run typecheck
npm run build
npx playwright install chromium
npm run test:ui      # 14 Chromium scenarios against the production server
```

Build before running browser tests. Playwright starts the production server or reuses one at port 3000. The browser suite uses the live API and controlled failure interception; production has no fixtures or mock mode. An optional [CI template](docs/CI_WORKFLOW.yml) runs unit tests, lint, typecheck and build independently of the live service; copy it to `.github/workflows/checks.yml` to enable GitHub Actions. The checks reported here were run locally. Final evidence and screenshots: [docs/QA.md](docs/QA.md).

## How Codex was directed and checked

The work followed requirements → API probes → scoped implementation → browser audit → focused fixes → submission checks. Decisions were checked against observed API behavior: corrected the Chatbots taxonomy; kept missing ratings and old dates honest; required exact-domain matches. The final audit reproduced repeated-query crashes, search-reset inconsistency, mobile explanation overflow and lost pagination context. Focused regression tests were added before the final verification. Broad additions such as accounts, a database and watchlists were left outside the test's scope.

## Not completed / next steps

The requested core scope is complete. No public hosting was configured; the archive is the chosen delivery format. A comprehensive accessibility audit, 200% text-resize review and Safari/Firefox coverage remain future work. FreeSERP availability and classification quality are external limitations; there is no persistent offline dataset.

Next improvements would be cross-browser/accessibility coverage, saved collections, and historical observations for trend analysis. Hosting can use a Next.js-compatible platform with Node 24, `npm ci`, `npm run build` and no environment variables.
