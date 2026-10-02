import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, Columns3 } from "lucide-react";
import { getSite, publicError } from "@/lib/freeserp/client";
import { normalizeDomain, safeReturnTo } from "@/lib/freeserp/urls";
import { formatDate, formatDR, formatSource } from "@/lib/freeserp/format";
import {
  CategoryBadges,
  DR_EXPLANATION,
  LIVE_EXPLANATION,
  SOURCE_EXPLANATION,
  SignalHelp,
  VisitLink,
} from "@/components/site-signals";
import { ReloadButton } from "@/components/reload-button";
import type { Site } from "@/lib/freeserp/types";

export const metadata: Metadata = {
  title: "Compare AI products",
  description:
    "Compare up to three AI products using real site summaries, categories, authority, technology and FreeSERP discovery dates.",
  robots: { index: false, follow: true },
};

interface LookupResult {
  domain: string;
  site: Site | null;
  error: string | null;
}

export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string | string[]; returnTo?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const requested =
    typeof params.domain === "string" ? [params.domain] : (params.domain ?? []);
  const normalized = requested.map(normalizeDomain);
  const domains = [
    ...new Set(
      normalized.filter((domain): domain is string => domain !== null),
    ),
  ];
  const valid =
    normalized.every(Boolean) && domains.length >= 2 && domains.length <= 3;
  if (!valid)
    return (
      <main className="container short-page detail-main" id="main-content">
        <Link className="back-link" href={returnTo}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to results
        </Link>
        <div className="result-state">
          <span className="state-icon">
            <Columns3 size={27} aria-hidden="true" />
          </span>
          <h1>A clearer view, side by side.</h1>
          <p>Select 2 or 3 products from discovery to compare their signals.</p>
          <Link className="button button-primary" href={returnTo}>
            Choose products
          </Link>
        </div>
      </main>
    );

  const records: LookupResult[] = await Promise.all(
    domains.map(async (domain) => {
      try {
        return { domain, site: await getSite(domain), error: null };
      } catch (error) {
        return { domain, site: null, error: publicError(error).error.message };
      }
    }),
  );
  const rows: {
    label: string;
    help?: string;
    render: (site: Site) => React.ReactNode;
  }[] = [
    {
      label: "Overview",
      render: (site) => (
        <p className="compare-summary">
          {site.summary ?? "No summary available."}
        </p>
      ),
    },
    { label: "Categories", render: (site) => <CategoryBadges site={site} /> },
    {
      label: "Domain Rating",
      help: DR_EXPLANATION,
      render: (site) => (
        <span className={site.dr === null ? "muted" : "comparison-rating"}>
          {formatDR(site.dr)}
          {site.dr !== null && <small> / 100</small>}
        </span>
      ),
    },
    {
      label: "Technology / builder",
      help: SOURCE_EXPLANATION,
      render: (site) => formatSource(site.source),
    },
    {
      label: "First confirmed live",
      help: LIVE_EXPLANATION,
      render: (site) => formatDate(site.wentLive),
    },
    {
      label: "First seen",
      help: "When FreeSERP first discovered the domain; not an exact company launch or registration date.",
      render: (site) => formatDate(site.firstSeen),
    },
    {
      label: "Top-level domain",
      render: (site) => (site.tld ? `.${site.tld}` : "Not available"),
    },
    {
      label: "Last HTTP status",
      help: "The status FreeSERP observed on its last crawl. This is not a real-time availability check.",
      render: (site) => site.httpStatus ?? "Not available",
    },
    { label: "Website", render: (site) => <VisitLink site={site} compact /> },
  ];
  return (
    <main className="container compare-main" id="main-content">
      <Link className="back-link" href={returnTo}>
        <ArrowLeft size={15} aria-hidden="true" />
        Back to results
      </Link>
      <div className="page-heading">
        <div className="eyebrow">SIDE-BY-SIDE RESEARCH</div>
        <h1>Compare the signals.</h1>
        <p>{domains.length} products. One clear view. Your judgment.</p>
      </div>
      <p className="comparison-scroll-hint">
        Scroll sideways to compare every product →
      </p>
      <div
        className="comparison-scroll"
        tabIndex={0}
        role="region"
        aria-label="Product comparison table; scroll horizontally on smaller screens"
      >
        <table className="comparison-table">
          <caption className="sr-only">
            Comparison of {domains.join(", ")}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="comparison-label">
                <span className="comparison-label-icon">
                  <Columns3 size={23} aria-hidden="true" />
                </span>
                Site intelligence
              </th>
              {records.map((record) => (
                <th scope="col" key={record.domain}>
                  <span className="domain-avatar" aria-hidden="true">
                    {record.domain[0].toUpperCase()}
                  </span>
                  <h2>
                    {record.site ? (
                      <Link
                        prefetch={false}
                        href={`/site/${record.domain}?${new URLSearchParams({ returnTo })}`}
                      >
                        {record.site.title}
                      </Link>
                    ) : (
                      record.domain
                    )}
                  </h2>
                  <p className="comparison-domain">{record.domain}</p>
                  {!record.site && (
                    <p className="comparison-missing">
                      {record.error
                        ? "Temporarily unavailable"
                        : "No exact record found"}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  {row.help && (
                    <SignalHelp label={row.label} explanation={row.help} />
                  )}
                </th>
                {records.map((record) => (
                  <td key={record.domain}>
                    {record.site ? (
                      row.render(record.site)
                    ) : (
                      <span className="muted">Not available</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.some((record) => record.error) && (
        <div className="comparison-retry" role="alert">
          <p>
            Some site records couldn’t load. You can retry without losing this
            comparison.
          </p>
          <ReloadButton />
        </div>
      )}
      <p className="data-note">
        Authority and discovery dates help you research. They don’t establish
        product quality or official launch dates.{" "}
        <Link href="/about">About these signals</Link>
      </p>
    </main>
  );
}
