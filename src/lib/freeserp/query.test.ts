import { describe, expect, it } from "vitest";
import {
  buildDomainQuery,
  buildSearchQuery,
  defaultFilters,
  parseFilters,
  parseOffset,
  resultsHref,
  serializeFilters,
} from "./query";

describe("FreeSERP query mapping", () => {
  it("always browses real sites with the required discovery defaults", () => {
    expect(Object.fromEntries(buildSearchQuery(defaultFilters))).toEqual({
      index: "sites",
      ai_startups: "1",
      size: "24",
      from: "0",
      sort: "went_live",
      order: "desc",
    });
  });
  it("maps all supported filters and calculates the UTC date at runtime", () => {
    const params = buildSearchQuery(
      {
        q: "voice agents",
        category: "code",
        source: "nextjs",
        dr: "20",
        days: "30",
        sort: "dr",
      },
      24,
      new Date("2026-10-02T03:00:00Z"),
    );
    expect(Object.fromEntries(params)).toMatchObject({
      q: "voice agents",
      ai_categories: "Code & Dev Tools",
      ai_source: "nextjs",
      dr_min: "20",
      from_date: "2026-09-02",
      sort: "dr",
      order: "desc",
      from: "24",
    });
  });
  it("uses the verified chatbot category rather than the misleading documentation value", () => {
    expect(
      buildSearchQuery({ ...defaultFilters, category: "chatbots" }).get(
        "ai_categories",
      ),
    ).toBe("AI Chatbot & Assistant");
  });
  it.each([
    ["newest", "went_live", "desc"],
    ["dr", "dr", "desc"],
    ["discovered", "first_seen", "desc"],
    ["relevance", "relevance", null],
  ] as const)("maps %s sorting", (sort, field, order) => {
    const params = buildSearchQuery({ ...defaultFilters, sort });
    expect(params.get("sort")).toBe(field);
    expect(params.get("order")).toBe(order);
  });
  it("uses domain boosting and includes records outside discovery filters for an exact lookup", () => {
    expect(Object.fromEntries(buildDomainQuery("example.test"))).toEqual({
      index: "sites",
      q: "example.test",
      all: "1",
      size: "1",
    });
  });
  it("handles month/year boundaries and the final paging window", () => {
    expect(
      buildSearchQuery(
        { ...defaultFilters, days: "7" },
        0,
        new Date("2026-01-03T23:00:00Z"),
      ).get("from_date"),
    ).toBe("2025-12-27");
    expect(buildSearchQuery(defaultFilters, 9990).get("size")).toBe("10");
  });
});

describe("URL state and validation", () => {
  it("round-trips shareable state and omits default values", () => {
    const filters = {
      ...defaultFilters,
      q: "AI voice",
      category: "agents" as const,
      days: "7" as const,
    };
    expect(parseFilters(serializeFilters(filters), true)).toEqual(filters);
    expect(resultsHref(defaultFilters)).toBe("/");
    expect(resultsHref(filters)).toBe("/?q=AI+voice&category=agents&days=7");
  });
  it.each([
    "index=web",
    "ai_startups=0",
    "source=unknown",
    "category=wrong",
    "dr=15",
    "days=-1",
    "sort=ip",
    "q=a&q=b",
    `q=${"a".repeat(301)}`,
  ])("rejects unsupported API input %s", (query) => {
    expect(() => parseFilters(new URLSearchParams(query), true)).toThrow(
      "invalid",
    );
  });
  it("gracefully defaults malformed shared UI filters", () => {
    expect(
      parseFilters(new URLSearchParams("category=missing&sort=wrong")),
    ).toEqual(defaultFilters);
  });
  it.each(["-1", "1.5", "10000", "no", "Infinity"])(
    "rejects invalid offset %s",
    (value) => {
      expect(() => parseOffset(new URLSearchParams({ from: value }))).toThrow();
    },
  );
});
