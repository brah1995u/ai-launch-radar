import type { SitePage } from "@/lib/freeserp/types";

interface Snapshot {
  page: SitePage;
  scrollY: number;
  expiresAt: number;
}

// SPA navigation only: bounded memory, never persisted or used as an API fallback.
export class DiscoverySession {
  private snapshots = new Map<string, Snapshot>();

  constructor(private now: () => number = Date.now) {}

  remember(key: string, page: SitePage, scrollY: number) {
    if (page.sites.length > 240) return;
    this.snapshots.delete(key);
    this.snapshots.set(key, { page, scrollY, expiresAt: this.now() + 300_000 });
    while (this.snapshots.size > 3)
      this.snapshots.delete(this.snapshots.keys().next().value!);
  }

  take(key: string): Snapshot | null {
    const snapshot = this.snapshots.get(key);
    this.snapshots.delete(key);
    return snapshot && snapshot.expiresAt > this.now() ? snapshot : null;
  }
}

export const discoverySession = new DiscoverySession();
