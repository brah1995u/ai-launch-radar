# Verification notes

Reviewed on October 2, 2026. Functional browser checks use a production build and live FreeSERP Main data; fixtures and controlled failures are confined to tests.

## Acceptance checklist

| Scenario from the hiring brief | Evidence                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| 1. Initial page loads          | Chromium acceptance test; visual preview                                                 |
| 2. Real data appears           | 24 live FreeSERP records in the initial view                                             |
| 3. Search works                | Button and Enter; no requests while typing                                               |
| 4. Category filter works       | Category membership checked against returned records                                     |
| 5. Technology filter works     | Returned `source` checked for `nextjs`                                                   |
| 6. DR filter works             | Returned numeric DR values checked against 20+                                           |
| 7. Date filter works           | Last 7 days applies and survives in URL; runtime mapping is unit-tested                  |
| 8. Sorting works               | Descending DR checked in the browser; all four mappings unit-tested                      |
| 9. Filters can be cleared      | Clear all restores the default URL and discovery                                         |
| 10. Empty state is usable      | Impossible live search; Clear filters recovers                                           |
| 11. API error state is usable  | Browser-only controlled 502; Try again recovers after removing interception              |
| 12. Load more works            | Real second page appends and retains existing visible records                            |
| 13. No duplicated domains      | Visible domain set checked after append; overlap covered in unit/component tests         |
| 14. Details work after refresh | Exact live domain and preserved return filters                                           |
| 15. Compare with 2 items       | Two record columns, plus successful refresh                                              |
| 16. Compare with 3 items       | Three record columns                                                                     |
| 17. Fourth item prevented      | Limit notice and unchanged selection                                                     |
| 18. Safe Visit links           | HTTP/HTTPS, new tab, `noopener noreferrer`; unsafe schemes unit-tested                   |
| 19. Mobile layout              | 375/768/1440 px, 1/2/3 columns, filter disclosure; comparison scroll contained at 375 px |
| 20. Browser history            | Back/Forward changes active category; filtered refresh restores state                    |

## Additional checks

- 56 Vitest unit/component tests, ESLint with zero warnings, TypeScript check, and production build.
- No API fixtures, production mock mode, API keys, authentication or database.
- Default discovery data was older than the current date, and live “New today” was zero. The UI preserves those facts rather than implying a fresh launch feed.
- `AI Chatbot & Assistant` was confirmed through a live query; the unprefixed documentation value returned no matches.
- SSR can temporarily include hidden streamed copies of markup. Acceptance tests inspect visible records and accessible controls to avoid mistaking transport markup for duplicated displayed products.
- Visual review covers spacing, hierarchy, card layout and small-screen overflow. No Lighthouse result or comprehensive accessibility certification is claimed.

Visual evidence: [desktop](screenshots/desktop.png), [mobile](screenshots/mobile.png), and [mobile comparison](screenshots/compare-mobile.png). These images show live API records observed during review; the application does not use them as data.
