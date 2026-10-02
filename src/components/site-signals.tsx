import { ArrowUpRight, Info } from "lucide-react";
import { formatDR, formatDate, formatSource } from "@/lib/freeserp/format";
import type { Site } from "@/lib/freeserp/types";

export function SignalHelp({
  label,
  explanation,
}: {
  label: string;
  explanation: string;
}) {
  return (
    <details className="signal-help">
      <summary aria-label={`About ${label}`}>
        <Info size={13} aria-hidden="true" />
      </summary>
      <span>{explanation}</span>
    </details>
  );
}

export const LIVE_EXPLANATION =
  "When FreeSERP first confirmed this site was reachable. This is a discovery signal, not the company's official launch date.";
export const DR_EXPLANATION =
  "FreeSERP's 0–100 authority signal from its link graph. It does not guarantee product quality. New domains may not be scored yet.";
export const SOURCE_EXPLANATION =
  "A detected technology or builder signal from FreeSERP, not a complete or verified technology stack.";

export function VisitLink({
  site,
  compact = false,
}: {
  site: Site;
  compact?: boolean;
}) {
  return site.url ? (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className={compact ? "visit-link" : "button button-primary"}
      aria-label={`Visit ${site.domain} (opens in a new tab)`}
    >
      {compact ? "Visit" : "Visit website"}
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  ) : (
    <span className="unavailable-link">Website unavailable</span>
  );
}

export function CategoryBadges({
  site,
  limit,
}: {
  site: Site;
  limit?: number;
}) {
  const categories = site.categories.length
    ? site.categories
    : site.category
      ? [site.category]
      : [];
  const shown = limit ? categories.slice(0, limit) : categories;
  return (
    <div className="category-badges">
      {shown.length ? (
        shown.map((category) => (
          <span className="badge" key={category}>
            {category}
          </span>
        ))
      ) : (
        <span className="badge badge-muted">Uncategorized</span>
      )}
      {limit && categories.length > limit ? (
        <span
          className="badge badge-muted"
          title={categories.slice(limit).join(", ")}
        >
          +{categories.length - limit}
        </span>
      ) : null}
    </div>
  );
}

export function SiteFacts({ site }: { site: Site }) {
  const facts = [
    { label: "Domain Rating", value: formatDR(site.dr), help: DR_EXPLANATION },
    {
      label: "Technology / builder",
      value: formatSource(site.source),
      help: SOURCE_EXPLANATION,
    },
    {
      label: "First confirmed live",
      value: formatDate(site.wentLive),
      help: LIVE_EXPLANATION,
    },
    {
      label: "First seen",
      value: formatDate(site.firstSeen),
      help: "When FreeSERP first discovered the domain. This is not an exact registration or company launch date.",
    },
    {
      label: "Top-level domain",
      value: site.tld ? `.${site.tld}` : "Not available",
    },
    {
      label: "Last HTTP status",
      value:
        site.httpStatus === null ? "Not available" : String(site.httpStatus),
      help: "The homepage status observed by FreeSERP's last crawl; it may have changed since then.",
    },
  ];
  return (
    <dl className="site-facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>
            {fact.label}
            {fact.help && (
              <SignalHelp label={fact.label} explanation={fact.help} />
            )}
          </dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
