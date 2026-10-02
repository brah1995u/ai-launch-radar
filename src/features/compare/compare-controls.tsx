"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Columns3, X } from "lucide-react";
import { useCompare } from "./compare-provider";
import type { Site } from "@/lib/freeserp/types";

export function CompareButton({
  site,
}: {
  site: Pick<Site, "domain" | "title">;
}) {
  const { selected, toggle } = useCompare();
  const checked = selected.some((item) => item.domain === site.domain);
  return (
    <button
      type="button"
      className={`compare-button ${checked ? "is-selected" : ""}`}
      aria-pressed={checked}
      aria-label={`${checked ? "Remove" : "Add"} ${site.domain} ${checked ? "from" : "to"} comparison`}
      onClick={() => toggle(site)}
    >
      {checked ? (
        <Check size={15} aria-hidden="true" />
      ) : (
        <Columns3 size={15} aria-hidden="true" />
      )}
      {checked ? "Selected" : "Compare"}
    </button>
  );
}

export function CompareBar({
  returnTo = "/",
  onNavigate,
}: {
  returnTo?: string;
  onNavigate?: () => void;
}) {
  const { selected, notice, clear, toggle } = useCompare();
  const [expanded, setExpanded] = useState(false);
  const params = new URLSearchParams();
  selected.forEach((site) => params.append("domain", site.domain));
  if (returnTo !== "/") params.set("returnTo", returnTo);
  return (
    <>
      <div role="status" className={notice ? "compare-notice" : "sr-only"}>
        {notice}
      </div>
      {selected.length >= 1 && (
        <aside className="compare-bar" aria-label="Selected sites">
          <div className="compare-bar-heading">
            <span className="compare-bar-icon">
              <Columns3 size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>
                {selected.length} {selected.length === 1 ? "site" : "sites"} selected
              </strong>
              <span>
                {selected.length === 1 ? "Select one more site" : "Compare up to 3"}
              </span>
            </div>
          </div>
          <div
            id="compare-selection"
            className={`compare-selection ${expanded ? "is-expanded" : ""}`}
          >
            {selected.map((site) => (
              <button
                key={site.domain}
                type="button"
                onClick={() => toggle(site)}
                aria-label={`Remove ${site.domain} from comparison`}
              >
                {site.domain}
                <X size={12} aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="compare-bar-actions">
            <button
              type="button"
              className="button button-quiet compare-edit"
              aria-expanded={expanded}
              aria-controls="compare-selection"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Hide" : "Edit"}
            </button>
            <button
              className="button button-quiet"
              type="button"
              onClick={clear}
            >
              Clear
            </button>
            {selected.length >= 2 ? (
              <Link
                prefetch={false}
                className="button button-primary"
                href={`/compare?${params}`}
                onClick={onNavigate}
              >
                Compare {selected.length}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : (
              <button type="button" disabled className="button button-primary">
                Compare 1
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
