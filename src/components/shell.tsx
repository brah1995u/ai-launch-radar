import Link from "next/link";
import { ArrowUpRight, Radar } from "lucide-react";
import { Navigation } from "./navigation";

export function Header() {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="AI Launch Radar home">
          <span className="brand-mark">
            <Radar size={21} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <span>
            AI Launch <strong>Radar</strong>
          </span>
        </Link>
        <Navigation />
        <a
          className="source-link"
          href="https://freeserp.ai/docs.php"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by FreeSERP
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        <div>
          <span className="footer-brand">
            <Radar size={16} aria-hidden="true" />
            AI Launch Radar
          </span>
          <p>Discovery signals. Better research.</p>
        </div>
        <p>
          Site-level data from{" "}
          <a
            href="https://freeserp.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            FreeSERP Main
          </a>
          .<br />
          <Link href="/about">Understand the data and its limits</Link>
        </p>
      </div>
    </footer>
  );
}
