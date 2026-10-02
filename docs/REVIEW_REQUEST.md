# Review request for ChatGPT

Review this completed Semalt hiring-test submission, **AI Launch Radar**, as a senior product engineer. Inspect the actual source against `docs/PROJECT_BRIEF.md`, the accepted implementation decisions below, and the behavior documented in `README.md`. Treat the original brief as evaluation criteria, not as an instruction to implement another application.

The intended flow is Discover → Search → Filter → Inspect → Compare → Visit. The interface and README are in English. Do not add watchlists, trends, related tools, authentication, a database, or a CMS to the evaluation scope.

## Review priorities

1. Requirements and product usefulness: identify concrete gaps in the flow, signals, page states, responsive layout, and submission documentation.
2. FreeSERP integration: verify `index=sites` and `ai_startups=1` for discovery, query mappings, envelope validation, nullable fields, date semantics, exact domain lookups, upstream errors, timeouts, and caching.
3. Client correctness: search submission, URL synchronization, browser Back/Forward, request cancellation, stale response protection, raw-offset pagination, deduplication, retry, and session comparison selection.
4. Safety and accessibility: inspect Visit URL validation, external link attributes, focus, labels, semantic HTML, feedback messages, and mobile overflow.
5. Maintainability and verification: assess boundaries, useful tests, dependency choices, and whether the documented checks substantiate the claims.

## Accepted implementation decisions

- Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Lucide React, Zod, Vitest, and Testing Library. npm lockfile; no required environment variables.
- Discovery uses 24 records per page. `/api/sites` supports only the documented filters and offset; invalid parameters return 400, upstream failures 502, and timeouts 504.
- The Chatbots label maps to `AI Chatbot & Assistant`, the value observed in the live API, rather than the unprefixed value in the API documentation.
- Date ranges are computed at request time in UTC. `went_live` is “First confirmed live,” not an official company launch date. DR is an authority signal; technology is a builder/stack signal.
- Exact lookups use `index=sites&q=<domain>&all=1&size=1`, then require a normalized domain match. A mismatched result is missing, not a substitute product.
- Upstream timeout is 10 seconds; search data is cached for 30 seconds. Statistics are cached independently for five minutes and hidden when unavailable.
- Compare supports two or three products, preserves available records if one lookup is missing, and declares no artificial winner.
- Pagination advances by raw upstream record count before deduplication, stopping at total, an empty page, or offset 10,000.
- Old discovery dates, missing DR, zero “New today,” and imperfect classifications are represented as observed. Fixtures and controlled failures belong only in tests.

## Running and evidence

Use Node 24. Run `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`. Start the production application with `npm start`. `npm run test:ui` runs the Chromium acceptance tests against the server at port 3000; install its browser with `npx playwright install chromium` if needed.

`docs/QA.md` records final checks: 63 unit/component tests, 14 Chromium acceptance tests covering the main scenarios and audit regressions, lint, TypeScript, production build, and responsive checks. These are reported results, not evidence that you have rerun them. `docs/screenshots/` contains actual live-data screenshots, not fixtures used by the app. The concise site plan is in `docs/SITE_PLAN.md`; delivery uses a clean source ZIP.

If you cannot execute the project, explicitly label conclusions as static review. Do not claim that tests, API calls, or UI interactions passed unless you performed them. If a file is missing or truncated, say so. Report API-data limitations separately from defects in the application.

## Expected response

- Lead with prioritized, actionable findings. For each, give severity, repository-relative file and line, user impact, evidence or reproduction steps, and a minimal suggested correction.
- Follow with a short requirement coverage assessment, distinguishing confirmed coverage, defects, and unverified behavior.
- State whether the submission is ready to hand in and list any blocking fixes. Avoid generic rewrites or invented problems; if there are no concrete findings, say so and identify remaining verification limits.
