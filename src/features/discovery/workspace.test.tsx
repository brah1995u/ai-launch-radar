import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { CompareProvider } from "@/features/compare/compare-provider";
import { defaultFilters } from "@/lib/freeserp/query";
import { page, site } from "@/test/fixtures";
import type { SitePage } from "@/lib/freeserp/types";
import { DiscoveryWorkspace } from "./workspace";

vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useSearchParams: () => {
      const query = useSyncExternalStore(
        (callback) => {
          window.addEventListener("radar:url", callback);
          return () => window.removeEventListener("radar:url", callback);
        },
        () => window.location.search,
        () => "",
      );
      return new URLSearchParams(query);
    },
  };
});
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

function setup(
  initialPage: SitePage | null = page(),
  initialError: string | null = null,
) {
  return render(
    <CompareProvider>
      <DiscoveryWorkspace
        initialFilters={defaultFilters}
        initialPage={initialPage}
        initialError={initialError}
      />
    </CompareProvider>,
  );
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  sessionStorage.clear();
  const original = window.history.pushState.bind(window.history);
  vi.spyOn(window.history, "pushState").mockImplementation((...args) => {
    original(...args);
    window.dispatchEvent(new Event("radar:url"));
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("discovery interactions", () => {
  it("uses server data without requesting it again on hydration", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    setup();
    expect(
      screen.getByRole("heading", { name: "Product example.test" }),
    ).toBeVisible();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("submits via Enter and never requests on individual keystrokes", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ ok: true, data: page([site("voice.test")]) }),
      );
    vi.stubGlobal("fetch", fetchMock);
    setup();
    await user.type(screen.getByRole("searchbox"), "voice");
    expect(fetchMock).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Product voice.test" }),
      ).toBeVisible(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("q=voice");
    expect(window.location.search).toContain("q=voice");
  });
  it("submits via Search and applies category shortcuts", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockImplementation(async () =>
        Response.json({ ok: true, data: page() }),
      );
    vi.stubGlobal("fetch", fetchMock);
    setup();
    await user.type(screen.getByRole("searchbox"), "agents");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole("button", { name: "AI Agents" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toContain("category=agents");
  });
  it("shows a useful empty state and clears filters", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ ok: true, data: page([]) }));
    vi.stubGlobal("fetch", fetchMock);
    setup(page([]));
    expect(
      screen.getByRole("heading", {
        name: "No AI products match these filters.",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "AI Agents" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Clear filters" }),
      ).toBeVisible(),
    );
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(window.location.search).toBe(""));
  });
  it("retries a friendly API error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ ok: true, data: page() })),
    );
    setup(null, "The data source may be temporarily unavailable.");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn’t load AI products.",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Product example.test" }),
      ).toBeVisible(),
    );
  });
  it("keeps unreadable proxy failures out of the user-facing error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<html>proxy failure</html>", { status: 502 }),
        ),
    );
    setup(null, "Initial failure.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "The data source may be temporarily unavailable.",
      ),
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("Unexpected token");
  });
  it("limits selection to three, exposes the comparison link, and lets users remove a selection", async () => {
    const user = userEvent.setup();
    setup(
      page([site("a.test"), site("b.test"), site("c.test"), site("d.test")]),
    );
    await waitFor(() =>
      expect(sessionStorage.getItem("ai-launch-radar:compare")).not.toBeNull(),
    );
    await user.click(
      screen.getByRole("button", { name: "Add a.test to comparison" }),
    );
    expect(
      screen.queryByRole("link", { name: "Compare 2" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Add b.test to comparison" }),
    );
    expect(screen.getByRole("link", { name: "Compare 2" })).toHaveAttribute(
      "href",
      "/compare?domain=a.test&domain=b.test",
    );
    await user.click(
      screen.getByRole("button", { name: "Add c.test to comparison" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Add d.test to comparison" }),
    );
    expect(
      screen.getByText(
        "You can compare up to 3 products. Remove one to add another.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Compare 3" })).toHaveAttribute(
      "href",
      "/compare?domain=a.test&domain=b.test&domain=c.test",
    );
    await user.click(
      screen.getAllByRole("button", {
        name: "Remove a.test from comparison",
      })[0],
    );
    expect(screen.getByRole("link", { name: "Compare 2" })).toBeVisible();
  });
  it("appends without duplicate domains and prevents simultaneous Load more requests", async () => {
    let resolve!: (response: Response) => void;
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    setup(page([site("a.test"), site("b.test")], { total: 4, nextFrom: 2 }));
    const button = screen.getByRole("button", { name: "Load more" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () =>
      resolve(
        Response.json({
          ok: true,
          data: page([site("b.test"), site("c.test")], {
            total: 4,
            from: 2,
            nextFrom: null,
          }),
        }),
      ),
    );
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "Load more" }),
    ).not.toBeInTheDocument();
  });
  it("discards stale responses even if a fetch ignores cancellation", async () => {
    const pending: {
      signal: AbortSignal;
      resolve: (response: Response) => void;
    }[] = [];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(
          (_url, options) =>
            new Promise<Response>((resolve) =>
              pending.push({ signal: options.signal, resolve }),
            ),
        ),
    );
    setup();
    fireEvent.click(screen.getByRole("button", { name: "AI Agents" }));
    await waitFor(() => expect(pending).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "Code & Dev" }));
    await waitFor(() => expect(pending).toHaveLength(2));
    expect(pending[0].signal.aborted).toBe(true);
    await act(async () =>
      pending[1].resolve(
        Response.json({ ok: true, data: page([site("latest.test")]) }),
      ),
    );
    await act(async () =>
      pending[0].resolve(
        Response.json({ ok: true, data: page([site("stale.test")]) }),
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Product latest.test" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Product stale.test" }),
    ).not.toBeInTheDocument();
  });
});
