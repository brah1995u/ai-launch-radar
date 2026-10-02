import { rawSiteSchema, searchEnvelopeSchema } from "./schemas";
import { normalizeDomain, safeExternalUrl } from "./urls";
import { PAGING_LIMIT } from "./query";
import type { Site, SitePage } from "./types";
import { normalizeDate } from "./dates";
import { mergeSites } from "./pagination";

const cleanText = (value: string | null | undefined) => value?.trim() || null;

export function normalizeSite(value: unknown): Site | null {
  const parsed = rawSiteSchema.safeParse(value);
  if (!parsed.success) return null;
  const raw = parsed.data;
  const domain = normalizeDomain(raw.domain);
  if (!domain) return null;
  return {
    domain,
    url: safeExternalUrl(raw.url),
    title: cleanText(raw.title) ?? domain,
    summary: cleanText(raw.ai_summary),
    category: cleanText(raw.category),
    categories: [
      ...new Set(
        (raw.ai_categories ?? []).map((item) => item.trim()).filter(Boolean),
      ),
    ],
    source: cleanText(raw.ai_source),
    dr: raw.dr ?? null,
    wentLive: normalizeDate(raw.went_live),
    firstSeen: normalizeDate(raw.first_seen),
    tld: cleanText(raw.tld),
    httpStatus: raw.http_status ?? null,
  };
}

export function normalizePage(value: unknown): SitePage {
  const parsed = searchEnvelopeSchema.parse(value);
  const sites: Site[] = [];
  let dropped = 0;
  for (const item of parsed.results) {
    const site = normalizeSite(item);
    if (site) sites.push(site);
    else dropped++;
  }
  if (dropped)
    console.warn(`[FreeSERP] Dropped ${dropped} invalid site records.`);
  if (parsed.count > 0 && !sites.length)
    throw new Error("No valid site records in the response.");
  const offset = parsed.from + parsed.count;
  return {
    sites: mergeSites([], sites),
    total: parsed.total,
    from: parsed.from,
    count: parsed.count,
    nextFrom:
      parsed.count > 0 && offset < Math.min(parsed.total, PAGING_LIMIT)
        ? offset
        : null,
  };
}
