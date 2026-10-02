import { describe, expect, it } from "vitest";
import { page, site } from "@/test/fixtures";
import { DiscoverySession } from "./session";

describe("return to discovery", () => {
  it("restores the loaded page and scroll for the same filters only once", () => {
    const session = new DiscoverySession();
    const loaded = page([site("first.test"), site("second.test")]);
    session.remember("category=agents", loaded, 1200);
    expect(session.take("category=code")).toBeNull();
    expect(session.take("category=agents")).toMatchObject({ page: loaded, scrollY: 1200 });
    expect(session.take("category=agents")).toBeNull();
  });
  it("expires snapshots after five minutes and bounds them to three entries", () => {
    let now = 0;
    const session = new DiscoverySession(() => now);
    for (const key of ["a", "b", "c", "d"]) session.remember(key, page(), 0);
    expect(session.take("a")).toBeNull();
    expect(session.take("b")).not.toBeNull();
    now = 300_000;
    expect(session.take("c")).toBeNull();
  });
  it("does not retain large discovery lists in memory", () => {
    const session = new DiscoverySession();
    session.remember("", page(Array.from({ length: 241 }, (_, i) => site(`${i}.test`))), 0);
    expect(session.take("")).toBeNull();
  });
});
