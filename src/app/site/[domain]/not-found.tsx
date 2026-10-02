import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { BackToResults } from "@/components/back-to-results";

export default function SiteNotFound() {
  return (
    <main className="container detail-main short-page" id="main-content">
      <Suspense
        fallback={
          <Link className="back-link" href="/">
            Back to results
          </Link>
        }
      >
        <BackToResults />
      </Suspense>
      <div className="result-state">
        <span className="state-icon">
          <SearchX size={27} aria-hidden="true" />
        </span>
        <h1>This site isn’t in the index.</h1>
        <p>
          FreeSERP didn’t return an exact match for this domain. Its record may
          be unavailable or no longer indexed.
        </p>
        <Link className="button button-primary" href="/">
          Explore AI products
        </Link>
      </div>
    </main>
  );
}
