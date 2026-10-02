import type { CategoryId, SortId, SourceId } from "./options";

export interface SearchFilters {
  q: string;
  category: CategoryId | "";
  source: SourceId | "";
  dr: "" | "10" | "20" | "30" | "50";
  days: "" | "7" | "30" | "90";
  sort: SortId;
}

export interface Site {
  domain: string;
  url: string | null;
  title: string;
  summary: string | null;
  category: string | null;
  categories: string[];
  source: string | null;
  dr: number | null;
  wentLive: string | null;
  firstSeen: string | null;
  tld: string | null;
  httpStatus: number | null;
}

export interface SitePage {
  sites: Site[];
  total: number;
  from: number;
  count: number;
  nextFrom: number | null;
}

export interface LiveStats {
  total: number;
  today: number;
  generatedAt: string;
}

export interface ApiError {
  code: "invalid_parameters" | "upstream" | "timeout" | "invalid_response";
  message: string;
}

export type SitesResponse =
  | { ok: true; data: SitePage }
  | { ok: false; error: ApiError };
