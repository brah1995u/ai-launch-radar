import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container short-page" id="main-content">
      <div className="result-state">
        <span className="state-icon">
          <SearchX aria-hidden="true" />
        </span>
        <h1>This page isn’t on the radar.</h1>
        <p>
          The address may be incorrect, or this site isn’t in the FreeSERP
          index.
        </p>
        <Link className="button button-primary" href="/">
          Back to discovery
        </Link>
      </div>
    </main>
  );
}
