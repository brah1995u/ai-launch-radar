import type { Site } from "./types";

export function mergeSites(existing: Site[], incoming: Site[]): Site[] {
  const seen = new Set(existing.map((site) => site.domain));
  return [
    ...existing,
    ...incoming.filter((site) => {
      if (seen.has(site.domain)) return false;
      seen.add(site.domain);
      return true;
    }),
  ];
}
