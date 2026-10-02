import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Code2,
  Database,
  Gauge,
  Radar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About the data",
  description:
    "Understand AI Launch Radar, FreeSERP Main site-level records, Domain Rating and the meaning of first confirmed live and first seen.",
};

export default function About() {
  return (
    <main className="container about-main" id="main-content">
      <div className="page-heading">
        <div className="eyebrow">
          <BookOpen size={14} aria-hidden="true" />A NOTE ON THE DATA
        </div>
        <h1>
          Good research starts
          <br />
          with clear signals.
        </h1>
        <p>Know what you’re looking at, and what it can tell you.</p>
      </div>
      <div className="about-layout">
        <section className="about-intro">
          <span className="about-mark">
            <Radar size={31} strokeWidth={1.4} aria-hidden="true" />
          </span>
          <h2>A first look at emerging AI.</h2>
          <p>
            AI Launch Radar helps founders, marketers, SEO specialists,
            developers and product researchers discover AI sites, inspect their
            signals and compare a few promising sites.
          </p>
          <p>
            It uses{" "}
            <a
              href="https://freeserp.ai/docs.php"
              target="_blank"
              rel="noopener noreferrer"
            >
              FreeSERP Main
            </a>
            , the homepage-level index (<code>index=sites</code>). Discovery
            requests use <code>ai_startups=1</code> to focus on AI product
            niches.
          </p>
          <p>
            The classifications are source signals: established companies,
            portfolios or agencies can appear. Inspect the summary and website
            before drawing conclusions.
          </p>
          <Link className="button button-primary" href="/">
            Start discovering
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <div className="about-definitions">
          <section>
            <span className="definition-icon">
              <CalendarDays size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>First confirmed live</h2>
              <p>
                <code>went_live</code> is the date FreeSERP’s liveness probe
                first confirmed the site was reachable. A company may have
                launched much earlier. This is never presented as its official
                launch date.
              </p>
            </div>
          </section>
          <section>
            <span className="definition-icon">
              <Database size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>First seen</h2>
              <p>
                <code>first_seen</code> is when the domain entered FreeSERP’s
                discovery feed. It is not a guaranteed registration date or
                company founding date.
              </p>
            </div>
          </section>
          <section>
            <span className="definition-icon">
              <Gauge size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>Domain Rating</h2>
              <p>
                <code>dr</code> is FreeSERP’s 0–100 authority signal from its
                link graph. It doesn’t guarantee a product’s usefulness or
                quality. New domains may be unscored; a minimum DR filter
                excludes those records.
              </p>
            </div>
          </section>
          <section>
            <span className="definition-icon">
              <Code2 size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>Technology / builder</h2>
              <p>
                <code>ai_source</code> is a detected builder or technology
                signal, such as Next.js or Lovable. It is not a complete or
                independently verified technology stack.
              </p>
            </div>
          </section>
        </div>
      </div>
      <aside className="about-caveat">
        <strong>A discovery index, not a company registry.</strong>
        <p>
          Dates, summaries, categories and HTTP status reflect FreeSERP
          observations and may be incomplete or out of date. Results are fetched
          from the API and briefly cached. No sites or statistics are
          fabricated.
        </p>
      </aside>
    </main>
  );
}
