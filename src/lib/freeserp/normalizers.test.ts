import { describe, expect, it, vi } from "vitest";
import { envelope, rawSite, site } from "@/test/fixtures";
import { normalizePage, normalizeSite } from "./normalizers";
import { normalizeDate } from "./dates";
import { mergeSites } from "./pagination";
import { formatDate, formatDR } from "./format";
import { normalizeDomain, safeExternalUrl, safeReturnTo } from "./urls";

describe("defensive records and formatting", () => {
  it("handles missing fields without inventing signals", () => {
    expect(normalizeSite({ domain: "example.test" })).toEqual({
      domain: "example.test",
      title: "example.test",
      url: null,
      summary: null,
      category: null,
      categories: [],
      source: null,
      dr: null,
      wentLive: null,
      firstSeen: null,
      tld: null,
      httpStatus: null,
    });
  });
  it("preserves zero ratings and treats malformed optional fields as missing", () => {
    expect(normalizeSite(rawSite())?.dr).toBe(0);
    expect(
      normalizeSite(
        rawSite("example.test", {
          dr: 300,
          ai_summary: 100,
          ai_categories: null,
          http_status: "200",
        }),
      ),
    ).toMatchObject({
      dr: null,
      summary: null,
      categories: [],
      httpStatus: null,
    });
    expect(formatDR(0)).toBe("0");
    expect(formatDR(null)).toBe("Not scored");
  });
  it("deduplicates categories and normalizes empty text", () => {
    expect(
      normalizeSite(
        rawSite("example.test", {
          ai_categories: [" Code & Dev Tools ", "Code & Dev Tools", ""],
          title: " ",
          ai_summary: " ",
        }),
      ),
    ).toMatchObject({
      categories: ["Code & Dev Tools"],
      title: "example.test",
      summary: null,
    });
  });
  it("validates calendar dates instead of silently rolling them forward", () => {
    expect(normalizeDate("2026-02-30")).toBeNull();
    expect(normalizeDate("2024-02-29")).toBe("2024-02-29");
    expect(normalizeDate("not a date")).toBeNull();
    expect(formatDate("2026-09-08")).toBe("Sep 8, 2026");
    expect(formatDate(null)).toBe("Not available");
  });
});

describe("pagination", () => {
  it("advances by raw upstream count even when domains overlap", () => {
    const result = normalizePage(
      envelope([rawSite(), rawSite()], { total: 10, from: 24 }),
    );
    expect(result.sites).toHaveLength(1);
    expect(result.nextFrom).toBeNull();
    expect(
      normalizePage(envelope([rawSite(), rawSite()], { total: 100, from: 24 }))
        .nextFrom,
    ).toBe(26);
  });
  it("keeps existing products while deduplicating incoming pages", () => {
    expect(
      mergeSites(
        [site("a.test")],
        [site("a.test"), site("b.test"), site("b.test")],
      ).map((item) => item.domain),
    ).toEqual(["a.test", "b.test"]);
  });
  it("stops at empty responses, exact totals, and the 10,000 result cap", () => {
    expect(normalizePage(envelope([], { total: 10 })).nextFrom).toBeNull();
    expect(normalizePage(envelope([rawSite()])).nextFrom).toBeNull();
    expect(
      normalizePage(envelope([rawSite()], { total: 20000, from: 9999 }))
        .nextFrom,
    ).toBeNull();
  });
  it("does not turn broken data into a normal empty state", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => normalizePage(envelope([{ domain: "invalid" }]))).toThrow();
    expect(() => normalizePage(envelope([], { index: "web" }))).toThrow();
    expect(() => normalizePage(envelope([], { count: 1 }))).toThrow();
  });
});

describe("safe URLs and domain matching", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "https://user:pass@example.test",
    "not a URL",
    "https://example.test/\npath",
  ])("rejects unsafe external URL %s", (url) => {
    expect(safeExternalUrl(url)).toBeNull();
  });
  it("accepts HTTP/HTTPS and canonicalizes domain input", () => {
    expect(safeExternalUrl("https://example.test/path")).toBe(
      "https://example.test/path",
    );
    expect(safeExternalUrl("http://example.test")).toBe("http://example.test/");
    expect(normalizeDomain("WWW.Example.TEST.")).toBe("example.test");
    expect(normalizeDomain("www.com")).toBe("www.com");
    expect(normalizeDomain("example.test/path")).toBeNull();
    expect(normalizeDomain("127.0.0.1")).toBeNull();
  });
  it("only permits a local results return path", () => {
    expect(safeReturnTo("/?q=voice&category=agents")).toBe(
      "/?q=voice&category=agents",
    );
    expect(safeReturnTo("//evil.test")).toBe("/");
    expect(safeReturnTo("https://evil.test")).toBe("/");
    expect(safeReturnTo("/compare")).toBe("/");
  });
});
