import { normalizeSite } from "@/lib/freeserp/normalizers";
import type { Site, SitePage } from "@/lib/freeserp/types";

export function rawSite(
  domain = "example.test",
  overrides: Record<string, unknown> = {},
) {
  return {
    domain,
    url: `https://${domain}`,
    title: `Product ${domain}`,
    ai_summary: "An AI product for research.",
    ai_categories: ["Code & Dev Tools"],
    ai_source: "nextjs",
    dr: 0,
    went_live: "2026-09-08",
    first_seen: "2026-08-05",
    tld: "test",
    http_status: 200,
    ...overrides,
  };
}

export function site(
  domain = "example.test",
  overrides: Record<string, unknown> = {},
): Site {
  const result = normalizeSite(rawSite(domain, overrides));
  if (!result) throw new Error("Invalid test fixture.");
  return result;
}

export function envelope(
  results: unknown[] = [],
  overrides: Record<string, unknown> = {},
) {
  return {
    ok: true,
    index: "sites",
    total: results.length,
    count: results.length,
    from: 0,
    size: 24,
    results,
    ...overrides,
  };
}

export function page(
  sites: Site[] = [site()],
  overrides: Partial<SitePage> = {},
): SitePage {
  return {
    sites,
    total: sites.length,
    from: 0,
    count: sites.length,
    nextFrom: null,
    ...overrides,
  };
}
