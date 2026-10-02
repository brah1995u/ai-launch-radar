import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator(".site-card:visible")).toHaveCount(24);
}

async function change(page: Page, action: () => Promise<unknown>) {
  const response = page.waitForResponse(
    (res) =>
      res.url().includes("/api/sites?") && res.request().method() === "GET",
  );
  await action();
  const result = await response;
  expect(result.ok()).toBe(true);
  const body = await result.json();
  expect(body.ok).toBe(true);
  await expect(page.locator(".results-section:visible")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  return body.data;
}

test("genuine discovery, safe Visit links, Search button and Enter", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await ready(page);
  await expect(page.locator(".site-card")).toHaveCount(24);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Discover what’s/,
  );
  const links = await page
    .locator(".site-card .visit-link")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        href: element.getAttribute("href"),
        target: element.getAttribute("target"),
        rel: element.getAttribute("rel"),
      })),
    );
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.href).toMatch(/^https?:\/\//);
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
    expect(link.rel).toContain("noreferrer");
  }
  let calls = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/sites?")) calls++;
  });
  await page.getByRole("searchbox").fill("voice");
  expect(calls).toBe(0);
  const voice = await change(page, () =>
    page.getByRole("searchbox").press("Enter"),
  );
  expect(voice.total).toBeGreaterThan(0);
  await expect(page).toHaveURL(/q=voice/);
  await page.getByRole("searchbox").fill("agent");
  const agents = await change(page, () =>
    page.getByRole("button", { name: "Search", exact: true }).click(),
  );
  expect(agents.total).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("category, technology, DR, date, sorting, clearing and URL history", async ({
  page,
}) => {
  await ready(page);
  const code = await change(page, () =>
    page
      .getByRole("combobox", { name: "Category", exact: true })
      .selectOption("code"),
  );
  expect(
    code.sites.every((site: { categories: string[] }) =>
      site.categories.includes("Code & Dev Tools"),
    ),
  ).toBe(true);
  const technology = await change(page, () =>
    page
      .getByRole("combobox", { name: "Technology / builder", exact: true })
      .selectOption("nextjs"),
  );
  expect(
    technology.sites.every(
      (site: { source: string }) => site.source === "nextjs",
    ),
  ).toBe(true);
  const authority = await change(page, () =>
    page
      .getByRole("combobox", { name: "Domain Rating", exact: true })
      .selectOption("20"),
  );
  expect(authority.sites.length).toBeGreaterThan(0);
  expect(
    authority.sites.every(
      (site: { dr: number | null }) => site.dr !== null && site.dr >= 20,
    ),
  ).toBe(true);
  const sorted = await change(page, () =>
    page
      .getByRole("combobox", { name: "Sort by", exact: true })
      .selectOption("dr"),
  );
  const ratings = sorted.sites.map((site: { dr: number }) => site.dr);
  expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  await change(page, () =>
    page
      .getByRole("combobox", { name: "First confirmed live", exact: true })
      .selectOption("7"),
  );
  await expect(page).toHaveURL(/days=7/);
  await change(page, () =>
    page.getByRole("button", { name: "Clear all", exact: true }).click(),
  );
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  await change(page, () =>
    page.getByRole("button", { name: "AI Agents", exact: true }).click(),
  );
  await change(page, () =>
    page.getByRole("button", { name: "Code & Dev", exact: true }).click(),
  );
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "AI Agents", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".results-section:visible")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.goForward();
  await expect(
    page.getByRole("button", { name: "Code & Dev", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Category", exact: true }),
  ).toHaveValue("code");
});

test("Load more appends real records without duplicate domains", async ({
  page,
}) => {
  await ready(page);
  const oldDomains = await page
    .locator(".site-card:visible .card-identity p")
    .allTextContents();
  await change(page, () =>
    page.getByRole("button", { name: "Load more", exact: true }).click(),
  );
  await expect
    .poll(() => page.locator(".site-card:visible").count())
    .toBeGreaterThan(24);
  const domains = await page
    .locator(".site-card:visible .card-identity p")
    .allTextContents();
  expect(domains.length).toBeGreaterThan(24);
  expect(new Set(domains).size).toBe(domains.length);
  expect(domains.slice(0, 24)).toEqual(oldDomains);
});

test("details survive refresh and preserve the results return path", async ({
  page,
}) => {
  await ready(page);
  await change(page, () =>
    page.getByRole("button", { name: "AI Agents", exact: true }).click(),
  );
  const domain = await page
    .locator(".site-card:visible .card-identity p")
    .first()
    .textContent();
  await page.locator(".site-card h3 a").first().click();
  await expect(
    page.getByRole("heading", { name: "Discovery signals" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".detail-domain")).toHaveText(domain!);
  await page.getByRole("link", { name: "Back to results" }).click();
  await expect(page).toHaveURL(/category=agents/);
  await expect(
    page.getByRole("button", { name: "AI Agents", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("2/3 product comparison, fourth-item limit and shareable refresh", async ({
  page,
}) => {
  await ready(page);
  for (let index = 0; index < 2; index++)
    await page
      .locator(".site-card")
      .nth(index)
      .getByRole("button", { name: /^Add / })
      .click();
  await page.getByRole("link", { name: "Compare 2", exact: true }).click();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(3);
  await page.reload();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(3);
  await page.getByRole("link", { name: "Back to results" }).click();
  await expect(
    page.getByRole("link", { name: "Compare 2", exact: true }),
  ).toBeVisible();
  await page
    .locator(".site-card")
    .nth(2)
    .getByRole("button", { name: /^Add / })
    .click();
  await page
    .locator(".site-card")
    .nth(3)
    .getByRole("button", { name: /^Add / })
    .click();
  await expect(
    page.getByText(
      "You can compare up to 3 products. Remove one to add another.",
    ),
  ).toBeVisible();
  await page.getByRole("link", { name: "Compare 3", exact: true }).click();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(4);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const tableScrolls = await page
    .locator(".comparison-scroll")
    .evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(tableScrolls).toBe(true);
});

test("real empty results and a controlled API failure both recover", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("searchbox")
    .fill("radar-nonexistent-023ea35b-e03c-40e2-8a7e");
  const empty = await change(page, () =>
    page.getByRole("button", { name: "Search", exact: true }).click(),
  );
  expect(empty.total).toBe(0);
  await expect(
    page.getByRole("heading", { name: "No AI products match these filters." }),
  ).toBeVisible();
  await change(page, () =>
    page.getByRole("button", { name: "Clear filters", exact: true }).click(),
  );
  await page.route("**/api/sites?**", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "upstream",
          message: "The data source may be temporarily unavailable.",
        },
      }),
    }),
  );
  await page.getByRole("button", { name: "AI Agents", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Couldn’t load AI products." }),
  ).toBeVisible();
  await page.unroute("**/api/sites?**");
  await change(page, () =>
    page.getByRole("button", { name: "Try again", exact: true }).click(),
  );
  await expect(page.locator(".site-card:visible")).toHaveCount(24);
});

for (const width of [375, 768, 1440]) {
  test(`responsive discovery and data explanation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1050 });
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width === 375) {
      await expect(
        page.getByRole("combobox", { name: "Category", exact: true }),
      ).not.toBeVisible();
      await page.getByRole("button", { name: /Filters.*Show/ }).click();
      await expect(
        page.getByRole("combobox", { name: "Category", exact: true }),
      ).toBeVisible();
    }
    const columns = await page
      .locator(".results-grid:visible")
      .evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(width === 375 ? 1 : width === 768 ? 2 : 3);
    await page
      .getByRole("link", { name: "About the data", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "First confirmed live" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("invalid proxy parameters and missing exact records are handled honestly", async ({
  request,
  page,
}) => {
  const invalid = await request.get("/api/sites?index=web");
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error.code).toBe("invalid_parameters");
  await page.goto("/site/radar-nonexistent-023ea35b.example");
  await expect(
    page.getByRole("heading", { name: "This site isn’t in the index." }),
  ).toBeVisible();
  await page.goto("/compare?domain=invalid");
  await expect(
    page.getByRole("link", { name: "Choose products" }),
  ).toBeVisible();
});
