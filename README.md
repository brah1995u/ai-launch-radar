# AI Launch Radar

Discover newly live AI products by category, stack and authority.

## Goal

Finding an AI product is easy; understanding why it is worth inspecting takes more work. AI Launch Radar provides a focused discovery workspace with site summaries, category filters, authority and builder signals, and side-by-side comparison. It is a Semalt hiring-test project built around genuine FreeSERP Main data.

## Audience

Founders, marketers, SEO specialists, developers and product researchers looking for newly discovered AI products and competitor research signals.

## Product structure

| Page                         | Purpose                                                                 |
| ---------------------------- | ----------------------------------------------------------------------- |
| `/`                          | Discover, search, filter, sort and compare AI sites                     |
| `/site/[domain]`             | Inspect the complete site summary and discovery signals                 |
| `/compare?domain=a&domain=b` | Share a comparison of 2–3 domains; records are fetched again on refresh |
| `/about`                     | Understand the source, fields and their limitations                     |

## Features

- Server-rendered initial discovery with live data, search by button or Enter, and no requests per keystroke.
- Fifteen category filters; eight technology/builder filters; Domain Rating and runtime date filters; four sort modes.
- Shareable URL filters with sensible refresh and browser Back/Forward behavior.
- Site details with an exact-domain match check; comparison selection capped at three and retained in sessionStorage.
- Load more with cancellation, request locking and domain deduplication.
- Optional live AI statistics, independent of search; honest loading, error, retry and empty states.
- Responsive layouts at 375, 768 and 1440 px, keyboard controls, visible focus, and safe external Visit links.

## Tech stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Lucide React and Zod. Tests use Vitest, Testing Library and Playwright/Chromium. npm manages dependencies with a committed lockfile. There is no database, authentication, CMS or mandatory environment variable.

The dev and build scripts use Next.js's supported Webpack option because Turbopack's local worker-port binding was blocked in the development sandbox. ESLint 9 is used for compatibility with the React plugin bundled by the Next.js ESLint configuration.

## FreeSERP integration

Source: [FreeSERP documentation](https://freeserp.ai/docs.php), [machine-readable help](https://freeserp.ai/api.php?help=1). The endpoint is `https://freeserp.ai/api.php`; no API key or registration is needed.

- Discovery explicitly uses **`index=sites`** (FreeSERP Main, homepage/site-level records) and **`ai_startups=1`**. It never switches to the web index.
- Default query: `sort=went_live&order=desc&size=24&from=0`, with no date or DR floor.
- `q`, `ai_categories`, `ai_source`, `dr_min`, `from_date`, `sort` and `order` map to the UI filters. Dates are computed at request time using UTC.
- **`went_live`** means “First confirmed live”: when FreeSERP first confirmed the site was reachable, not its official company launch date.
- **`first_seen`** means “First seen”: when the domain entered the discovery feed, not a guaranteed registration date.
- **`dr`** is FreeSERP's 0–100 authority signal, not a quality guarantee. Missing scores remain “Not scored”; zero is preserved. A DR floor excludes unscored sites.
- **`ai_source`** is a detected technology/builder signal, not a complete stack inventory.
- Live probes confirmed that Chatbots must send `AI Chatbot & Assistant`. The unprefixed documentation value `Chatbot & Assistant` returned zero results.
- Detail and comparison lookups use `index=sites&q=<domain>&all=1&size=1`, and accept a record only if its normalized domain matches. Lookup intentionally does not apply discovery filters.

`src/lib/freeserp/` separates query mapping, types, schemas, fetching, normalization and small pure helpers. `/api/sites` whitelists user input and returns a stable response; `/api/stats` reads only AI statistics. Upstream calls have a 10-second timeout, search data is briefly cached for 30 seconds, and statistics for 5 minutes. Pagination advances by raw upstream count and stops at the exact total, an empty page, or the 10,000-result window.

## Local setup

Use Node.js 24 (`.nvmrc` is included):

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Production mode:

```bash
npm run build
npm start
```

## Verification

The following checks were successfully run during implementation:

```bash
npm test           # 56 unit/component tests
npm run lint      # zero errors or warnings
npm run typecheck
npm run build
npm run test:ui   # 10 Chromium acceptance tests against the production server
```

For browser checks on a fresh machine, first run `npx playwright install chromium` after building. `npm run test:ui` starts `npm start` automatically or reuses the existing local server. These acceptance tests depend on the live FreeSERP service; unit/component tests use fixtures only in tests and do not need network access.

The browser suite checks the main search/filter flow, URL history, safe Visit attributes, real empty results, controlled API failure and retry, pagination, details after refresh, 2/3-item comparison, the fourth-item limit, and responsive layouts. Visual review was also performed in the local preview. See [QA notes](docs/QA.md). No Lighthouse score is claimed.

## Vercel deployment

1. Push this repository, including `package-lock.json`, to your Git provider.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select **Next.js**, with the repository root as Root Directory and Node.js **24.x**.
4. Use install command **`npm ci`**, build command **`npm run build`**, and the framework's default Output Directory. Add no environment variables.
5. Deploy, then smoke-test discovery, a shared filtered URL, a detail URL and a comparison URL.

The project is deployment-ready; publishing to a Vercel account is a separate step. [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs).

## AI-assisted workflow

Codex was used as a coding agent to analyze requirements, verify API behavior, structure the application, implement components and integration, refactor, and assist with tests and debugging. Generated work was checked through live API probes, code review, linting, unit/component tests, a production build, real-browser functional tests and visual review. Verification found and corrected API taxonomy differences, cross-realm timeout handling and tooling compatibility issues.

## Known limitations

- FreeSERP classification is heuristic: established companies, agencies and portfolios can appear despite `ai_startups=1`.
- Discovery dates and HTTP status can be old; new records may be unscored or missing summaries. Date filters can legitimately return no results.
- Availability depends on FreeSERP; short caches do not provide a persistent offline dataset.
- Comparison selection is local to a browser session. There are no accounts or persistent saved collections.
- Browser acceptance tests currently cover Chromium; a comprehensive accessibility audit and additional browsers have not been tested.

## If I had more time

Saved watchlists and shareable collections, historical trends backed by stored observations, richer competitor discovery, an accessibility audit, and cross-browser regression coverage.

## Independent review

The original hiring brief is preserved in [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md). Use [docs/REVIEW_REQUEST.md](docs/REVIEW_REQUEST.md) for a focused review of the implementation and accepted API decisions. Verification evidence and screenshots are in [docs/QA.md](docs/QA.md).
