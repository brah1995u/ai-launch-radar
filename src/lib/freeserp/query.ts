import { categories, sorts, sources } from "./options";
import type { SearchFilters } from "./types";

export const PAGE_SIZE = 24;
export const PAGING_LIMIT = 10_000;
export const defaultFilters: SearchFilters = {
  q: "",
  category: "",
  source: "",
  dr: "",
  days: "",
  sort: "newest",
};
const allowedParameters = new Set([
  "q",
  "category",
  "source",
  "dr",
  "days",
  "sort",
  "from",
]);

export class InvalidParametersError extends Error {
  constructor() {
    super("The search parameters are invalid.");
  }
}

export function parseFilters(
  params: URLSearchParams,
  strict = false,
): SearchFilters {
  if (
    strict &&
    [...params.keys()].some(
      (key) => !allowedParameters.has(key) || params.getAll(key).length > 1,
    )
  ) {
    throw new InvalidParametersError();
  }
  const q = (params.get("q") ?? "").trim();
  const category = params.get("category") ?? "";
  const source = params.get("source") ?? "";
  const dr = params.get("dr") ?? "";
  const days = params.get("days") ?? "";
  const sort = params.get("sort") ?? "newest";
  const validCategory =
    category === "" || categories.some((item) => item.id === category);
  const validSource =
    source === "" || sources.some((item) => item.value === source);
  const validDr = ["", "10", "20", "30", "50"].includes(dr);
  const validDays = ["", "7", "30", "90"].includes(days);
  const validSort = sorts.some((item) => item.value === sort);
  if (
    strict &&
    (q.length > 300 ||
      !validCategory ||
      !validSource ||
      !validDr ||
      !validDays ||
      !validSort)
  ) {
    throw new InvalidParametersError();
  }
  return {
    q: q.slice(0, 300),
    category: validCategory ? (category as SearchFilters["category"]) : "",
    source: validSource ? (source as SearchFilters["source"]) : "",
    dr: validDr ? (dr as SearchFilters["dr"]) : "",
    days: validDays ? (days as SearchFilters["days"]) : "",
    sort: validSort ? (sort as SearchFilters["sort"]) : "newest",
  };
}

export function parseOffset(params: URLSearchParams): number {
  const raw = params.get("from") ?? "0";
  if (!/^\d+$/.test(raw)) throw new InvalidParametersError();
  const from = Number(raw);
  if (!Number.isSafeInteger(from) || from < 0 || from >= PAGING_LIMIT)
    throw new InvalidParametersError();
  return from;
}

export function serializeFilters(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && !(key === "sort" && value === "newest"))
      params.set(key, value);
  }
  return params;
}

export function resultsHref(filters: SearchFilters): string {
  const query = serializeFilters(filters).toString();
  return query ? `/?${query}` : "/";
}

export function buildSearchQuery(
  filters: SearchFilters,
  from = 0,
  now = new Date(),
): URLSearchParams {
  const params = new URLSearchParams({
    index: "sites",
    ai_startups: "1",
    size: String(Math.min(PAGE_SIZE, PAGING_LIMIT - from)),
    from: String(from),
  });
  const mapping = sorts.find((item) => item.value === filters.sort) ?? sorts[0];
  params.set("sort", mapping.sort);
  if (mapping.order) params.set("order", mapping.order);
  if (filters.q) params.set("q", filters.q);
  if (filters.category)
    params.set(
      "ai_categories",
      categories.find((item) => item.id === filters.category)!.value,
    );
  if (filters.source) params.set("ai_source", filters.source);
  if (filters.dr) params.set("dr_min", filters.dr);
  if (filters.days) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - Number(filters.days));
    params.set("from_date", date.toISOString().slice(0, 10));
  }
  return params;
}

export function buildDomainQuery(domain: string): URLSearchParams {
  return new URLSearchParams({
    index: "sites",
    q: domain,
    all: "1",
    size: "1",
  });
}

export function paramsFromRecord(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value))
      value.forEach((item) => params.append(key, item));
  }
  return params;
}
