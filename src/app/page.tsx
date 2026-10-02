import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowUpRight, Compass, Globe2 } from "lucide-react";
import Link from "next/link";
import { publicError, searchSites } from "@/lib/freeserp/client";
import { paramsFromRecord, parseFilters } from "@/lib/freeserp/query";
import type { SitePage } from "@/lib/freeserp/types";
import { DiscoveryWorkspace } from "@/features/discovery/workspace";
import { LiveStatsStrip } from "@/features/discovery/live-stats";
import { ResultsSkeleton } from "@/features/discovery/states";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const filters = parseFilters(paramsFromRecord(await searchParams));
  let page: SitePage | null = null;
  let error: string | null = null;
  try {
    page = await searchSites(filters);
  } catch (cause) {
    error = publicError(cause).error.message;
  }
  return (
    <main className="container discovery-main" id="main-content">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            YOUR AI DISCOVERY WORKSPACE
          </div>
          <h1 id="hero-heading">
            Discover what’s
            <br className="desktop-break" /> <span>newly live in AI.</span>
          </h1>
          <p className="hero-tagline">
            Explore AI sites by category, technology and authority.
          </p>
        </div>
        <div className="hero-context">
          <div>
            <strong>A signal, not a launch claim.</strong>
            <p>
              FreeSERP’s AI niche includes products, agencies and research sites.
              Discovery dates describe crawl observations.
            </p>
            <Link href="/about">
              How to read the data
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="context-bottom">
            <span>
              <Globe2 size={13} aria-hidden="true" />
              Site-level records
            </span>
            <Compass size={17} aria-hidden="true" />
          </div>
        </div>
      </section>
      <LiveStatsStrip />
      <Suspense fallback={<ResultsSkeleton />}>
        <DiscoveryWorkspace
          initialFilters={filters}
          initialPage={page}
          initialError={error}
        />
      </Suspense>
    </main>
  );
}
