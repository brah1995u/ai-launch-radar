import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, FileSearch, Globe2 } from "lucide-react";
import { getSite, publicError } from "@/lib/freeserp/client";
import { normalizeDomain, safeReturnTo } from "@/lib/freeserp/urls";
import {
  CategoryBadges,
  SiteFacts,
  VisitLink,
} from "@/components/site-signals";
import { CompareBar, CompareButton } from "@/features/compare/compare-controls";
import { ReloadButton } from "@/components/reload-button";

interface Props {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = normalizeDomain((await params).domain);
  return {
    title: domain ? `${domain} — Site signals` : "Site not found",
    description: domain
      ? `Inspect ${domain}: summary, categories, Domain Rating, technology and FreeSERP discovery dates.`
      : "This site record is unavailable.",
  };
}

export default async function SiteDetail({ params, searchParams }: Props) {
  await connection();
  const domain = normalizeDomain((await params).domain);
  if (!domain) notFound();
  const returnTo = safeReturnTo((await searchParams).returnTo);
  let site;
  try {
    site = await getSite(domain);
  } catch (error) {
    return (
      <main className="container detail-main" id="main-content">
        <Link className="back-link" href={returnTo}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to results
        </Link>
        <div className="result-state" role="alert">
          <span className="state-icon state-error">
            <FileSearch size={26} aria-hidden="true" />
          </span>
          <h1>Couldn’t load this site.</h1>
          <p>{publicError(error).error.message}</p>
          <ReloadButton />
        </div>
      </main>
    );
  }
  if (!site) notFound();
  return (
    <main className="container detail-main" id="main-content">
      <Link className="back-link" href={returnTo}>
        <ArrowLeft size={15} aria-hidden="true" />
        Back to results
      </Link>
      <div className="eyebrow detail-eyebrow">
        SITE INTELLIGENCE / {site.domain}
      </div>
      <article className="detail-card">
        <header className="detail-header">
          <span className="domain-avatar detail-avatar" aria-hidden="true">
            {site.domain[0].toUpperCase()}
          </span>
          <div>
            <h1>{site.title}</h1>
            <p className="detail-domain">
              <Globe2 size={15} aria-hidden="true" />
              {site.domain}
            </p>
          </div>
          <div className="detail-actions">
            <CompareButton site={site} />
            <VisitLink site={site} />
          </div>
        </header>
        <div className="detail-body">
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading">What this site does</h2>
            <p className="full-summary">
              {site.summary ??
                "FreeSERP hasn’t provided a summary for this site yet."}
            </p>
            <CategoryBadges site={site} />
          </section>
          <section aria-labelledby="signals-heading">
            <div className="detail-section-heading">
              <h2 id="signals-heading">Discovery signals</h2>
              <span>From FreeSERP Main</span>
            </div>
            <SiteFacts site={site} />
          </section>
          <p className="data-note">
            These are observed discovery signals, not verified company launch
            information. <Link href="/about">Learn how to interpret them.</Link>
          </p>
        </div>
      </article>
      <CompareBar returnTo={returnTo} />
    </main>
  );
}
