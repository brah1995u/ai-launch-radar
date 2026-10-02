import { buildDomainQuery, buildSearchQuery } from "./query";
import { normalizePage } from "./normalizers";
import { statsSchema } from "./schemas";
import { normalizeDomain } from "./urls";
import type {
  ApiError,
  LiveStats,
  SearchFilters,
  Site,
  SitePage,
} from "./types";

const ENDPOINT = "https://freeserp.ai/api.php";

export class FreeSerpError extends Error {
  constructor(
    public readonly code: ApiError["code"],
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "FreeSerpError";
  }
}

async function request(
  params: URLSearchParams,
  revalidate = 30,
): Promise<unknown> {
  try {
    const response = await fetch(`${ENDPOINT}?${params}`, {
      headers: { Accept: "application/json", "X-Agent": "AI-Launch-Radar/1.0" },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate },
    });
    if (!response.ok)
      throw new FreeSerpError(
        "upstream",
        502,
        "The data source may be temporarily unavailable.",
      );
    try {
      return await response.json();
    } catch {
      throw new FreeSerpError(
        "invalid_response",
        502,
        "The data source returned an unexpected response.",
      );
    }
  } catch (error) {
    if (error instanceof FreeSerpError) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      ["TimeoutError", "AbortError"].includes(String(error.name))
    ) {
      throw new FreeSerpError(
        "timeout",
        504,
        "The data source took too long to respond. Please try again.",
      );
    }
    throw new FreeSerpError(
      "upstream",
      502,
      "The data source may be temporarily unavailable.",
    );
  }
}

function parsePage(value: unknown): SitePage {
  try {
    return normalizePage(value);
  } catch {
    throw new FreeSerpError(
      "invalid_response",
      502,
      "The data source returned an unexpected response.",
    );
  }
}

export async function searchSites(
  filters: SearchFilters,
  from = 0,
): Promise<SitePage> {
  return parsePage(await request(buildSearchQuery(filters, from)));
}

export async function getSite(requestedDomain: string): Promise<Site | null> {
  const domain = normalizeDomain(requestedDomain);
  if (!domain) return null;
  const page = parsePage(await request(buildDomainQuery(domain)));
  return page.sites.find((site) => site.domain === domain) ?? null;
}

export async function getStats(): Promise<LiveStats> {
  const raw = await request(new URLSearchParams({ stats: "1" }), 300);
  const parsed = statsSchema.safeParse(raw);
  if (!parsed.success)
    throw new FreeSerpError(
      "invalid_response",
      502,
      "Statistics are currently unavailable.",
    );
  return {
    total: parsed.data.ai_startups.total,
    today: parsed.data.ai_startups.today,
    generatedAt: parsed.data.generated_at,
  };
}

export function publicError(error: unknown): {
  error: ApiError;
  status: number;
} {
  if (error instanceof FreeSerpError)
    return {
      error: { code: error.code, message: error.message },
      status: error.status,
    };
  console.error("[FreeSERP] Unexpected data-layer failure.");
  return {
    error: {
      code: "upstream",
      message: "The data source may be temporarily unavailable.",
    },
    status: 502,
  };
}
