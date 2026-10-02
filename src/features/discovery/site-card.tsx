import Link from "next/link";
import { CalendarDays, Code2, Globe2 } from "lucide-react";
import {
  CategoryBadges,
  DR_EXPLANATION,
  LIVE_EXPLANATION,
  SignalHelp,
  VisitLink,
} from "@/components/site-signals";
import { formatDR, formatDate, formatSource } from "@/lib/freeserp/format";
import { CompareButton } from "@/features/compare/compare-controls";
import type { Site } from "@/lib/freeserp/types";

export function SiteCard({ site, returnTo }: { site: Site; returnTo: string }) {
  const detailHref = `/site/${encodeURIComponent(site.domain)}?${new URLSearchParams({ returnTo })}`;
  return (
    <article className="site-card">
      <div className="card-heading">
        <span className="domain-avatar" aria-hidden="true">
          {site.domain[0].toUpperCase()}
        </span>
        <div className="card-identity">
          <h3>
            <Link prefetch={false} href={detailHref} title={site.title}>
              {site.title}
            </Link>
          </h3>
          <p>
            <Globe2 size={11} aria-hidden="true" />
            {site.domain}
          </p>
        </div>
        <span
          className="site-record-marker"
          title="FreeSERP site-level record"
          aria-hidden="true"
        />
      </div>
      <p className={`card-summary ${!site.summary ? "muted" : ""}`}>
        {site.summary ??
          "No summary available from FreeSERP yet. Open the site record to inspect its discovery signals."}
      </p>
      <CategoryBadges site={site} limit={2} />
      <dl className="card-signals">
        <div>
          <dt>
            Domain Rating
            <SignalHelp label="Domain Rating" explanation={DR_EXPLANATION} />
          </dt>
          <dd className={site.dr === null ? "rating-unscored" : "rating-score"}>
            {formatDR(site.dr)}
            {site.dr !== null && <span>/ 100</span>}
          </dd>
        </div>
        <div>
          <dt>
            <Code2 size={13} aria-hidden="true" />
            Technology / builder
          </dt>
          <dd>{formatSource(site.source)}</dd>
        </div>
      </dl>
      <div className="card-date">
        <span>
          <CalendarDays size={13} aria-hidden="true" />
          First confirmed live
          <SignalHelp
            label="First confirmed live"
            explanation={LIVE_EXPLANATION}
          />
        </span>
        <time dateTime={site.wentLive ?? undefined}>
          {formatDate(site.wentLive)}
        </time>
      </div>
      <div className="card-actions">
        <CompareButton site={site} />
        <VisitLink site={site} compact />
      </div>
    </article>
  );
}
