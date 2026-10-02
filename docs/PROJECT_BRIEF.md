You are the lead product engineer responsible for completing a hiring test project from start to finish.

Do not only scaffold the project or give me instructions. Work directly in the repository, create the application, run it, test it, fix problems, and leave the repository in a submission-ready state.

Do not ask me for confirmation after every step. Make sensible engineering decisions and continue unless you are genuinely blocked.

# CONTEXT

This is a hiring test for Semalt.

The company wants to evaluate:

1. how I work with Codex / AI coding agents;
2. whether I can turn a vague idea into a useful product;
3. whether I understand and correctly integrate a public API;
4. whether I verify AI-generated work instead of blindly trusting it;
5. general web-development quality;
6. product thinking;
7. code quality and maintainability.

The task specifically requires using the public FreeSERP API:

- FreeSERP Main / `index=sites`
- AI niche
- no API key or registration
- homepage/site-level data rather than general web pages

Do NOT change the task to `index=web`.

The final result must be deployable to Vercel and include a high-quality README.

---

# PRODUCT

Build a polished small SaaS-style web product called:

AI Launch Radar

Tagline:

Discover newly live AI products by category, stack and authority.

This must NOT look like a generic AI-generated “AI tools directory”.

It should feel like a lightweight research / discovery / analytics product that could genuinely be useful to:

- founders;
- SEO specialists;
- marketers;
- developers;
- product researchers;
- competitive intelligence teams.

The core user problem:

“I want to discover new AI products in a specific niche, understand what they are, see basic authority/technology signals, and quickly compare several products.”

---

# CORE USER FLOW

The main experience must be:

Discover → Search → Filter → Inspect → Compare → Visit.

A new visitor should understand what the product does within approximately 5 seconds.

---

# TECHNOLOGY

Use:

- Next.js with App Router;
- TypeScript;
- Tailwind CSS;
- React;
- Lucide React for icons;
- Zod if useful for runtime validation of external API data;
- Vitest + Testing Library for a small focused test suite.

Use npm unless the repository already clearly uses another package manager.

Do not add a database.

Do not add authentication.

Do not add Firebase.

Do not add Supabase.

Do not add a CMS.

Do not add a large UI framework.

Do not add animation libraries unless there is an extremely strong reason.

Keep dependencies minimal.

The project must not require environment variables or API keys to run.

---

# BEFORE IMPLEMENTATION

First:

1. Inspect the current repository and environment.
2. Check Node/npm versions.
3. Read the FreeSERP API documentation supplied by the task.
4. If network access is available, inspect the machine-readable FreeSERP help endpoint before coding.
5. Confirm the exact response structure and supported filters.
6. Write a concise implementation plan.
7. Then immediately execute that plan without waiting for my approval.

Do not invent API fields.

Do not invent API results.

Do not use production mock data when the API is available.

Mock data is allowed only in tests.

---

# FREESERP API

Use the HTTPS API endpoint at the FreeSERP domain, `/api.php`.

The main production search must explicitly use:

index=sites
ai_startups=1

The product must take advantage of the FreeSERP Main fields, including where available:

- domain
- url
- title
- ai_summary
- category
- ai_categories
- ai_source
- dr
- went_live
- first_seen
- tld
- http_status

Treat external data defensively.

Fields can be null or missing.

Domain Rating can be null.

Do not assume every result is perfect.

---

# IMPORTANT DATA SEMANTICS

Do not describe `went_live` as the official company launch date.

It means the date FreeSERP's liveness probe first confirmed that the site was reachable.

In the UI call this:

“First confirmed live”

Provide a small tooltip or explanation.

`first_seen` should be called:

“First seen”

Do not imply that it is the exact registration or company launch date.

Domain Rating is an authority signal from FreeSERP.

Do not present it as a guarantee of quality.

---

# DEFAULT QUERY

The initial discovery view should retrieve genuine AI products using approximately this logical configuration:

index = sites
ai_startups = 1
sort = went_live
order = desc
size = 24

Do not hardcode returned products.

---

# SEARCH

Provide a prominent search field.

Placeholder example:

Search AI agents, coding tools, voice apps...

The user must be able to submit via:

- Search button;
- Enter key.

Do NOT fire a network request for every single keystroke.

Search should use the `q` API parameter.

---

# FILTERS

Implement useful filters using real FreeSERP parameters.

## Category

Use `ai_categories`.

Support useful categories such as:

- AI Agents & Autonomous
- Code & Dev Tools
- AI Infrastructure & API
- AI Automation & Workflows
- LLM & Prompt Tools
- AI Search & Answers
- AI Website Builder
- No-code / App Builder
- Image Generation
- Video Generation
- Voice & Text-to-Speech
- Data & Analytics
- Research & Science
- Design & UI
- Chatbot & Assistant

Use the exact API values when sending requests.

## Technology / Builder

Use `ai_source`.

Useful options can include available values such as:

- nextjs
- react
- wordpress
- webflow
- lovable
- v0
- bolt
- base44

Never claim `ai_source` is always the site's full technology stack.

Label the filter:

Technology / builder

or another accurate description.

## Domain Rating

Use `dr_min`.

UI choices:

Any
10+
20+
30+
50+

## Date

Use `from_date` against `went_live`.

UI choices:

Any time
Last 7 days
Last 30 days
Last 90 days

Calculate dates at runtime.

## Sorting

Support:

Newest → sort=went_live, order=desc

Highest DR → sort=dr, order=desc

Recently discovered → sort=first_seen, order=desc

Relevance → sort=relevance

---

# URL STATE

Search/filter state should be reflected in URL search parameters where reasonably possible.

For example, a filtered state should be shareable and survive refresh.

Use a clean URL scheme.

Browser back/forward should behave sensibly.

Do not over-engineer this.

---

# MAIN PAGE

Create `/`.

Desktop structure:

1. compact top navigation;
2. hero / product explanation;
3. optional live API stats;
4. search;
5. quick category shortcuts;
6. filters;
7. result information / active filter state;
8. responsive cards;
9. load more;
10. footer/data attribution.

The page should feel like a real product, not a landing-page template.

---

# HERO

Suggested content:

AI Launch Radar

Discover newly live AI products by category, stack and authority.

Supporting text should explain in one short sentence that the data comes from live web discovery signals.

Do not write long marketing paragraphs.

---

# LIVE STATS

If the FreeSERP statistics endpoint is stable and straightforward, use it to show a small live stats strip such as:

AI products indexed
New today
Live data

Do not hardcode statistics.

If the stats endpoint causes reliability or implementation problems, remove this feature rather than weakening the main product.

Core search is more important than stats.

---

# QUICK CATEGORIES

Under the search area, provide compact category chips for several popular categories such as:

AI Agents
Code & Dev
Automation
Image
Video
Voice
Chatbots
AI Search

Clicking a chip applies the corresponding real `ai_categories` filter.

Keep this compact.

---

# RESULT CARDS

Each product card should clearly show:

- title;
- domain;
- concise AI summary;
- one or more category badges;
- Domain Rating;
- technology / builder signal;
- First confirmed live date;
- Compare action;
- Visit website action.

Cards should be highly scannable.

Do not overload them with every available API field.

Clamp very long summaries to keep card heights reasonable.

Use graceful fallbacks for missing values.

Do not fetch third-party logos just to decorate the cards.

If a visual identifier is useful, create a lightweight local domain initial/avatar.

---

# CARD ACTIONS

Primary external action:

Visit

Open in a new tab with appropriate security attributes.

Secondary action:

Compare

Allow selecting up to three products.

Clearly communicate the maximum.

---

# COMPARE UX

When at least two products are selected, show a sticky comparison bar.

Example:

2 products selected

Clear
Compare 2

The bar must work on desktop and mobile.

Limit comparison to three products.

---

# COMPARE PAGE

Create `/compare`.

Use query parameters or another simple shareable mechanism to identify the selected domains.

The comparison should display 2–3 products side by side.

Compare:

- title/domain;
- summary;
- categories;
- Domain Rating;
- technology/builder;
- First confirmed live;
- First seen;
- TLD;
- HTTP status if useful;
- Visit website.

Do NOT generate a fake “winner”.

The purpose is comparison, not arbitrary scoring.

On mobile, make the comparison usable through horizontal scrolling or a stacked layout.

---

# DETAIL PAGE

Create a dynamic site details route:

`/site/[domain]`

Use a real FreeSERP exact-domain lookup.

When looking up a domain, verify that the returned domain actually matches the requested domain before treating the result as an exact match.

Display:

- product title;
- domain;
- full summary;
- categories;
- Domain Rating;
- technology/builder;
- First confirmed live;
- First seen;
- TLD;
- status;
- Visit website.

Provide a back-to-results action.

Do not make this page visually overcomplicated.

---

# ABOUT / DATA PAGE

Create `/about`.

Keep it concise.

Explain:

- what AI Launch Radar is;
- intended audience;
- that it uses FreeSERP Main site-level data;
- what Domain Rating represents;
- what “First confirmed live” means;
- that dates/signals are discovery indicators and not guaranteed official company launch information.

This page is important because it demonstrates understanding of the API rather than blindly rendering fields.

---

# PAGINATION

Use `size` and `from`.

Use a:

Load more

button rather than infinite scrolling.

When loading more:

- keep existing cards;
- show a small loading state;
- prevent duplicate requests;
- avoid duplicated domains if the API returns overlap.

Stop offering Load more when there are no more results according to the response.

---

# DATA LAYER

Create a clean FreeSERP data-access layer rather than scattering fetch calls throughout UI components.

Prefer a structure along the lines of:

src/
  app/
  components/
  features/
  lib/
    freeserp/
      client.ts
      types.ts
      schemas.ts
      query.ts
      normalizers.ts

You can adjust the exact structure if a simpler architecture is cleaner.

Keep concerns separated:

- query building;
- fetching;
- validation;
- normalization;
- UI.

---

# SERVER API LAYER

Prefer a small internal Next.js API layer such as:

/api/sites
/api/stats

Whitelist supported user-controlled parameters.

Do not blindly proxy arbitrary query parameters.

Normalize upstream errors into a stable response for the frontend.

Use sensible short caching where appropriate.

FreeSERP itself uses short edge caching, so do not build an unnecessarily complex cache system.

The internal API layer should make the frontend simpler and reduce direct coupling to the external service.

If after implementation this layer clearly adds complexity without benefit, simplify it, but keep the external data access centralized.

---

# REQUEST CONTROL

Handle requests carefully.

Implement:

- loading states;
- error states;
- empty states;
- retry;
- stale-request protection or AbortController where relevant.

Do not allow rapid UI changes to create visibly inconsistent results.

---

# ERROR STATE

Example tone:

Couldn't load AI products.

The data source may be temporarily unavailable.

Try again

Do not show raw stack traces or ugly JSON errors to users.

---

# EMPTY STATE

Example:

No AI products match these filters.

Try changing the category, date or Domain Rating.

Clear filters

---

# DESIGN DIRECTION

Create a polished B2B SaaS / analytics aesthetic.

Do NOT create:

- cyberpunk design;
- neon purple AI cliché;
- excessive gradients;
- glassmorphism everywhere;
- huge floating illustrations;
- excessive animation.

Use:

- light neutral background;
- white surfaces;
- dark readable typography;
- restrained blue primary accent;
- one subtle secondary accent if needed;
- subtle borders;
- subtle shadows;
- generous spacing;
- approximately 12–16px corner radii;
- clear information hierarchy.

The product should visually feel closer to a modern analytics/search tool than a marketing landing page.

Desktop content width should be controlled and readable.

Do not stretch content awkwardly across ultra-wide screens.

---

# RESPONSIVE DESIGN

Must work well at approximately:

375px mobile
768px tablet
1440px desktop

Mobile:

- search full width;
- filters accessible without becoming a huge wall;
- cards one column;
- compare bar remains usable;
- no horizontal page overflow.

Desktop:

- 2–3 card columns depending on width;
- filters should be fast to scan.

---

# ACCESSIBILITY

Use:

- semantic HTML;
- proper buttons;
- labels;
- keyboard-focus states;
- visible focus indicators;
- sufficient contrast;
- descriptive link text;
- `aria` only where actually needed.

Do not use clickable `<div>` elements where a button or link is appropriate.

---

# SEO / WEB QUALITY

Because the role also involves technical SEO and website optimization, demonstrate basic web quality.

Implement:

- useful page titles;
- meta descriptions;
- correct heading hierarchy;
- semantic structure;
- clean URLs;
- no unnecessary client-side JavaScript;
- no giant dependencies;
- no layout shift caused by decorative content;
- good mobile behavior.

Keep the project friendly to PageSpeed/Lighthouse.

Do not claim a Lighthouse score unless you actually measured it.

---

# PERFORMANCE

Prefer:

- CSS/Tailwind over JS animation;
- native browser APIs;
- lightweight icons;
- no unnecessary images;
- no huge client bundles.

Avoid premature optimization, but keep the architecture lean.

---

# TYPES AND VALIDATION

Create proper TypeScript types for FreeSERP responses.

Treat external data as untrusted.

If using Zod, parse/validate API responses in the data layer and fail gracefully.

At minimum account for:

- nullable `dr`;
- missing summary;
- missing dates;
- unexpected URLs;
- empty categories;
- errors from upstream.

React already escapes rendered strings; do not dangerously inject API HTML.

---

# UTILITIES

Create small tested helpers for things such as:

- building FreeSERP query parameters;
- formatting DR;
- formatting dates;
- validating external HTTP/HTTPS URLs;
- mapping UI sort values to API sort/order values.

Do not create giant utility files.

---

# TESTING

Add a small focused automated test suite.

Do not chase 100% coverage.

Test valuable logic such as:

1. query builder correctly maps filters to FreeSERP parameters;
2. sort mapping;
3. null/missing field normalization;
4. URL validation;
5. one important UI state if practical.

All tests must pass.

---

# MANUAL QA

Before considering the project complete, manually review or otherwise verify:

1. initial page loads;
2. real data appears;
3. search works;
4. category filter works;
5. technology filter works;
6. DR filter works;
7. date filter works;
8. sorting works;
9. filters can be cleared;
10. empty state is usable;
11. API error state is usable;
12. load more works;
13. duplicates are not introduced;
14. details page works after refresh;
15. compare works with 2 items;
16. compare works with 3 items;
17. fourth comparison item is prevented gracefully;
18. external Visit links are safe;
19. mobile layout has no obvious overflow;
20. browser back/forward works reasonably with URL filters.

---

# BUILD VERIFICATION

Before finishing, run the available equivalents of:

npm test
npm run lint
npm run build

If any command fails:

fix the problem and rerun it.

Do not leave the repository with known type errors, lint errors or build errors.

---

# README

Create an excellent but concise `README.md`.

It must include:

## Project

AI Launch Radar

## Goal

Explain the problem in 2–4 sentences.

## Audience

Founders, marketers, SEO specialists, developers and product researchers looking for newly discovered AI products.

## Product structure

Explain the main pages.

## Features

Search
Filters
Sorting
Discovery
Details
Comparison
Responsive UI
Error/loading states

## Tech stack

List the actual technology used.

## FreeSERP integration

Explain which index is used and the important filters/fields.

Explicitly explain:

- `index=sites`;
- `ai_startups=1`;
- `went_live`;
- `first_seen`;
- `dr`.

## Local setup

Exact commands required to run the project.

## Verification

List the actual checks that were successfully run.

Do not claim checks you did not run.

## AI-assisted workflow

Be transparent.

Explain that Codex was used as a coding agent to:

- analyze requirements;
- help structure the application;
- implement components/data integration;
- refactor;
- assist with tests and debugging.

Also state that generated work was verified through:

- API behavior checks;
- code review;
- linting;
- tests;
- production build;
- manual UI/functional review where actually performed.

Do not pretend the project was written without AI.

That would directly conflict with the purpose of the test.

## Known limitations

Be honest.

Only list actual limitations.

Possible examples if still true:

- no user accounts;
- no persistent saved collections;
- FreeSERP discovery dates are signals, not official launch dates;
- availability depends on the external FreeSERP service.

## If I had more time

Potential future improvements:

- saved watchlists;
- trend history;
- shareable collections;
- richer competitor discovery;
- accessibility audit;
- end-to-end tests.

Keep this section realistic.

---

# CODE QUALITY

Avoid giant components.

Extract components when they have a clear responsibility.

Prefer readable code over clever abstractions.

Names must be descriptive.

Do not leave:

- TODO placeholders;
- dead code;
- console debugging;
- commented-out experiments;
- fake placeholder results.

Do not silently swallow errors.

---

# VISUAL POLISH

Pay attention to:

- alignment;
- spacing;
- hover states;
- focus states;
- skeletons;
- badge consistency;
- card heights;
- truncation;
- mobile filter usability;
- sticky compare bar;
- typography hierarchy.

The product should look intentionally designed rather than like default Tailwind components pasted together.

However:

functionality is more important than visual tricks.

---

# COPY

Keep product copy concise and natural.

Avoid AI-generated marketing clichés such as:

“Revolutionize your AI journey”
“Unlock the power of AI”
“Next-generation innovation”

Prefer direct language.

Examples:

Discover newly live AI products.

Search by niche, stack or domain.

First confirmed live

First seen

Domain Rating

Technology / builder

Visit website

Compare

Load more

---

# PRODUCT PRINCIPLES

When choosing between two implementations, prioritize in this order:

1. correct API behavior;
2. reliability;
3. clear UX;
4. maintainability;
5. performance;
6. visual polish;
7. extra features.

Do not sacrifice the first five for animations or decorative work.

---

# SCOPE CONTROL

Core P0 functionality:

- real FreeSERP integration;
- discovery;
- search;
- filters;
- sorting;
- result cards;
- loading/error/empty;
- details;
- compare;
- responsive UI;
- README;
- passing build/lint/tests.

P1:

- live stats;
- URL state polish;
- shareable comparison.

P2/stretch:

- related tools;
- additional trend visualization;
- advanced filtering.

Do not work on P2 until P0 is completely stable.

---

# FINAL REVIEW

When implementation is complete, perform one final reviewer-style audit.

Ask:

1. Does this clearly satisfy the Semalt test?
2. Is FreeSERP genuinely central to the product?
3. Can a reviewer understand the product in 5 seconds?
4. Does every major button work?
5. Are we accurately representing API data?
6. Are important null/error cases handled?
7. Does it work on mobile?
8. Would I confidently deploy this repository?
9. Does the README explain how AI was used?
10. Is there anything that looks obviously AI-generated, unfinished, fake or over-engineered?

Fix any material issue discovered by that audit.

Then provide me with a concise final report containing:

- what you built;
- architecture;
- files created/changed;
- API functionality implemented;
- tests executed;
- build/lint status;
- any remaining limitations;
- exact local run command;
- exact recommended Vercel deployment steps.

Do not stop at an implementation plan.

Complete the project.