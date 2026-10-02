import { afterEach, describe, expect, it, vi } from "vitest";
import { envelope, rawSite } from "@/test/fixtures";
import { defaultFilters } from "./query";
import { getSite, getStats, searchSites } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("FreeSERP client", () => {
  it("verifies an exact match rather than trusting the top search result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json(envelope([rawSite("other.test")])));
    vi.stubGlobal("fetch", fetchMock);
    expect(await getSite("requested.test")).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toContain(
      "index=sites&q=requested.test&all=1&size=1",
    );
    fetchMock.mockResolvedValue(
      Response.json(envelope([rawSite("requested.test")])),
    );
    expect((await getSite("WWW.Requested.TEST"))?.domain).toBe(
      "requested.test",
    );
  });
  it("does not request invalid domains", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await getSite("https://wrong.test/path")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("normalizes upstream HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("sensitive upstream detail", { status: 502 }),
        ),
    );
    await expect(searchSites(defaultFilters)).rejects.toMatchObject({
      code: "upstream",
      status: 502,
    });
  });
  it("normalizes timeouts separately", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
    );
    await expect(searchSites(defaultFilters)).rejects.toMatchObject({
      code: "timeout",
      status: 504,
    });
  });
  it.each(["TimeoutError", "AbortError"])("keeps %s during body download as a 504", async (name) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => { throw new DOMException("body interrupted", name); },
    }));
    await expect(searchSites(defaultFilters)).rejects.toMatchObject({ code: "timeout", status: 504 });
    expect(console.warn).toHaveBeenCalledWith("[FreeSERP] Request failed.",
      expect.objectContaining({ code: "timeout", upstreamStatus: 200 }));
  });
  it("rejects malformed JSON and wrong-index responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("not JSON"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchSites(defaultFilters)).rejects.toMatchObject({
      code: "invalid_response",
    });
    fetchMock.mockResolvedValue(Response.json(envelope([], { index: "web" })));
    await expect(searchSites(defaultFilters)).rejects.toMatchObject({
      code: "invalid_response",
    });
  });
  it("reads AI statistics without substituting global totals", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            ok: true,
            generated_at: "2026-10-02T14:00:00+00:00",
            ai_startups: { total: 42, today: 0 },
            totals: { real_sites: 20000000 },
          }),
        ),
    );
    expect(await getStats()).toEqual({
      total: 42,
      today: 0,
      generatedAt: "2026-10-02T14:00:00+00:00",
    });
  });
});
