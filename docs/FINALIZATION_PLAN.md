# Finalization plan — AI Launch Radar

Completed on 2026-10-02. The findings below describe the pre-finalization audit of commit `7d2c075`; their scoped corrections are now implemented. Final verification and delivery evidence are in [QA.md](QA.md), and the concise site plan is in [SITE_PLAN.md](SITE_PLAN.md). Delivery uses a source ZIP. Public hosting, a comprehensive accessibility audit, 200% text-resize review and additional browsers remain explicitly documented future work.

The CI configuration is supplied as `docs/CI_WORKFLOW.yml`, ready to copy into `.github/workflows/checks.yml`. It is not activated in the public repository: GitHub rejected workflow creation because the connected OAuth app lacks the `workflow` scope. Local verification and the archive are unaffected.

## Decision

The project satisfies the core brief and has an appropriate architecture for a small API-backed application. Finish with a bounded correctness and usability pass, then prepare the submission. Retain Next.js, the existing feature boundaries, FreeSERP Main, and the current discovery defaults.

The previous check in this chat passed 56 unit/component tests, lint, typecheck, and the production build, and confirmed live API responses. This deeper review inspected the running application at 375, 768, and 1440 px, exercised discovery, selection, comparison, details, filter clearing, pagination, and malformed URL handling. Two temporary unit probes also confirmed the timeout-classification issue below; they were removed after the audit. The complete Playwright suite was not rerun in this deeper review. There is no Lighthouse score or comprehensive accessibility certification.

Git now contains commit `7d2c075` and an `origin` pointing to `https://github.com/brah1995u/ai-launch-radar.git`. The earlier missing-commit observation is no longer current. No deployment URL or submission archive was found in the local project.

## Findings and corrections

### 1. P1 — Repeated returnTo parameters crash valid detail/comparison routes

- Files: `src/lib/freeserp/urls.ts:49`, `src/app/site/[domain]/page.tsx:18`, `src/app/compare/page.tsx:35`.
- Reproduction: open `/site/quartzdevelopment.site?returnTo=%2F&returnTo=%2F%3Fq%3Dvoice`. The running app displays “Something interrupted this page.”
- Cause: repeated query parameters become an array, while the page signatures and `safeReturnTo` assume a string. The call to `startsWith` occurs before the helper's try/catch. The comparison route shares the same unsafe call; that second route was identified by source inspection.
- Correction: give the page query types their actual `string | string[] | undefined` shape, and accept/validate unknown input in `safeReturnTo`. Ambiguous or invalid return paths should fall back to `/`.
- Acceptance: repeated, absent, malformed, and external return paths never crash either route; valid local filtered return paths still work. Add helper regressions and a browser check for each affected route.

### 2. P1 — Mobile signal explanations overflow the viewport

- Files: `src/components/site-signals.tsx:5`, `src/app/globals.css:784`, `src/app/globals.css:1785`.
- Reproduction: at 375 px, open the Technology / builder explanation on the QuartzDevs detail page. Its right edge reaches approximately 396 px and the document scroll width grows from 375 to 396 px. Part of the explanation is cut off.
- Correction: anchor explanations so they remain within the viewport in both grid columns, cards, and the comparison table. Increase the summary hit area from the measured 13×13 px. Keep the existing native disclosure if a small CSS change can solve positioning; avoid adding a UI dependency.
- Acceptance: every explanation is readable at 320/375/768 px, opened explanations do not create page-level horizontal scrolling, and keyboard activation and closing remain usable.

### 3. P2 — Clear all leaves an unsubmitted search draft behind

- Files: `src/features/discovery/search-form.tsx:13`, `src/features/discovery/workspace.tsx:204`, `src/features/discovery/filters.tsx`.
- Reproduction: select AI Agents, type `voice` without submitting, then press Clear all. The URL becomes `/` and the heading becomes “On the radar,” but the field still displays `voice`. Confirmed in the running app.
- Cause: the form owns its draft and remounts only when `filters.q` changes. In this scenario the applied query stays empty.
- Correction: make an explicit reset action clear both the draft and the applied filters. Keep draft edits separate from the submitted query, and retain the no-request-per-keystroke behavior.
- Acceptance: Clear all and the empty-state Clear filters action reset the field, URL, filters, and results consistently. Ordinary category changes do not unexpectedly erase a draft. Cover Enter, button submission, and history restoration.

### 4. P2 — Inspecting a later result loses the discovery context

- Files: `src/features/discovery/workspace.tsx:77`, `src/app/site/[domain]/page.tsx`, `src/components/back-to-results.tsx`.
- Reproduction: Load more to obtain 48 cards, open `harringtonmiller.co.uk` from card 25, then use Back to results. The running app returns to 24 cards at scroll position 0.
- Impact: researchers must repeat pagination and find their place after every inspection.
- Correction: retain the loaded result list, next offset, and return position in a small bounded in-memory session cache keyed by canonical filters. Define a short lifetime and a small entry limit; avoid persistent storage of the dataset. Invalidate appropriately when filters change. Direct visits and refreshes must continue to fetch real API data.
- Acceptance: returning from details restores the inspected list and position; switching filters cannot restore another query's data; retry and pagination cancellation still work. A fresh direct URL works without a cache.

### 5. P2 — Selection is difficult to manage on mobile/tablet

- Files: `src/features/compare/compare-controls.tsx:43`, `src/app/globals.css:1469`, `src/app/compare/page.tsx`.
- Confirmed: below 1100 px, selected domains and their remove buttons are hidden. The bar exposes a count, Clear, and Compare. The comparison page itself has no selection-editing controls. A one-item selection has no bar.
- Impact: once a selected site is outside the current filter/page, a user cannot remove that one item from the mobile bar without clearing everything or finding its card again.
- Correction: expose selected domains and individual removal through a compact expandable mobile selection area. Give one selected item visible feedback with a disabled comparison action and a prompt to select another. Keep the maximum at three and preserve the current shareable comparison URLs.
- Acceptance: select across categories, remove any selected site while its card is absent, and retain the others. Check one/two/three selections and the fourth-item warning. The expanded bar must not obscure focused controls or the final result actions.

### 6. P2 — Readability and information density need one visual pass

- Files: `src/app/globals.css`, `src/app/page.tsx`, `src/app/compare/page.tsx`.
- Confirmed mobile initial view: at 375×812, search begins around y=410 and the first card around y=723. The hero repeats its message, and quick categories occupy three rows.
- Confirmed tablet view: at 768 px, five filter controls remain on one row with 10 px text; several values are truncated.
- Confirmed contrast: About's caveat text is approximately 3.19:1 on its background. Comparison row labels calculate to approximately 3.29:1 from their CSS colors. Both are below the 4.5:1 target for ordinary small text. References: [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C target-size guidance and exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Small hit areas alone are not a complete WCAG conformance assessment.
- Correction: shorten repetitive hero copy and mobile spacing; use a compact internally scrolling category row or fewer visible shortcuts with access to the complete category selector. Increase meaningful metadata text sizes and darken the identified weak text colors. Reflow filters into two or three columns at tablet widths. Increase mobile action areas without making the whole page taller.
- Comparison: keep the allowed horizontal-scrolling model, but reduce excessive label-column width and make row labels easy to retain while moving between products. Use a concise overview with a clear path to the full detail summary if necessary. Full summaries currently produce approximately 251/342 px tall cells for the first two records.
- Acceptance: at 375×812, the first site's identity and a useful portion of its summary appear in the initial view; controls and labels are readable at 375/768/1440 px; table scrolling remains contained; keyboard focus and 200% text scaling are reviewed. Avoid claiming a complete accessibility audit.

### 7. P2 — Timeouts during response-body reading receive the wrong error code

- File: `src/lib/freeserp/client.ts:43`.
- Confirmed by temporary unit probes: a TimeoutError from `fetch` becomes `timeout`/504, but the same error from `response.json()` becomes `invalid_response`/502.
- Cause: the inner JSON catch converts every error before the outer timeout classifier can inspect it.
- Correction: allow timeout/abort failures from body reading to reach the shared classifier, while malformed JSON retains `invalid_response`/502. Add minimal server diagnostics for upstream status, elapsed time, and failure category; avoid logging complete response bodies or search queries.
- Acceptance: header-stage and body-stage timeouts both report 504; malformed JSON still reports 502; the user-facing message stays concise. Replace the temporary observation probes with permanent tests for the intended behavior.

### 8. Product/source limitation — AI-product claims are stronger than the data

- Files: `src/features/discovery/live-stats.tsx`, `src/features/discovery/states.tsx`, `src/app/page.tsx`, `README.md`.
- Observed: the newest default records include agencies and portfolios, many DR values are missing, newest observed live dates are September 8, and New today is zero on October 2. These are source limitations, not fabricated results or a broken query.
- Correction: use accurate “AI sites” / “sites in AI niches” wording for totals and results, and one concise source explanation where needed. Preserve `index=sites`, `ai_startups=1`, real dates, null DR, and zero counts. Do not introduce hidden editorial filtering or replace real results to make the demo look fresher.
- Acceptance: the default feed and date/DR empty states remain honest, and the product's visible promises fit the data it actually presents.

## Execution order

1. **Correctness:** fix repeated URL parameters, explicit search resets, and timeout classification. Add focused regressions.
2. **Responsive UI:** fix explanation positioning and hit areas, weak contrast, tablet filters, and mobile first-screen density. Keep the current visual identity.
3. **Research flow:** preserve discovery context and expose selection management on mobile. Recheck shared comparisons, including a fresh session and a missing record.
4. **Engineering verification:** run the existing tests, lint, typecheck, build, then the full browser suite against a fresh production server. Add only checks for the discovered gaps. Restart the production server after a build so it serves matching assets.
5. **Documentation:** update feature/limitation statements and QA evidence to match the final behavior. Keep the README concise, add a small page-block structure to the existing site plan, and describe a few real examples of how Codex output was directed and checked. Distinguish fixture tests, live API checks, and manual review.
6. **Delivery:** commit the final changes, push the existing repository, prepare a Vercel demo or a clean source ZIP, and test the exact artifact the reviewer will receive. CI for test/lint/typecheck/build is useful if handing in a GitHub repository; live API browser tests should not be required for every ordinary CI run.

## Architecture boundaries

- Keep server fetching, upstream validation, and normalization in `src/lib/freeserp` and the existing route handlers.
- Treat URL parameters as untrusted inputs with their actual runtime shapes.
- Keep draft search text and submitted URL filters distinct, with an explicit reset transition.
- Use a bounded browser-memory cache only for returning to discovery; do not add a database or long-lived dataset.
- Extract a small discovery-state hook only if the state/cache changes make `workspace.tsx` substantially harder to understand. A broad rewrite is unnecessary for the current component size.
- Preserve cancellation, generation checks, raw-offset pagination, deduplication, and exact-domain verification through the changes.
- Finish within the existing feature scope. Watchlists, accounts, trends, and related tools belong to future work.

## Submission gate

- [x] P1 URL handling and mobile explanation defects are fixed.
- [x] Search reset, return context, mobile selection, and timeout behavior meet their scoped acceptance criteria.
- [x] Responsive views at 375/768/1440 px and disclosures at 320/375/768 px pass; keyboard disclosure and table scrolling are checked. Enlarged-text review remains future work.
- [x] 63 unit/component tests, lint, typecheck, and production build pass.
- [x] All 14 browser scenarios, including the new regressions, pass against the final production server.
- [x] Real FreeSERP Main remains central; no production fixtures, keys, or required environment variables were introduced.
- [x] README and site plan cover the requested documentation and concrete AI-workflow examples.
- [x] The source ZIP was extracted and checked from a clean directory.
- [x] Delivery format is the permitted source archive; hosted-demo checks do not apply.
- [x] ZIP excludes generated/private files and includes source, lockfile, configuration, tests and useful QA documentation.

Completion means all applicable submission-gate items pass and a usable demo or archive is ready. Additional features are not part of this finalization pass.
