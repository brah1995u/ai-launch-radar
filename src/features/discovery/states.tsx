import { AlertCircle, SearchX } from "lucide-react";

export function SearchError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="result-state" role="alert">
      <span className="state-icon state-error">
        <AlertCircle size={25} aria-hidden="true" />
      </span>
      <h3>Couldn’t load AI products.</h3>
      <p>{message}</p>
      <button type="button" className="button button-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="result-state">
      <span className="state-icon">
        <SearchX size={27} aria-hidden="true" />
      </span>
      <h3>No AI products match these filters.</h3>
      <p>Try changing the category, date or Domain Rating.</p>
      <button
        className="button button-secondary"
        type="button"
        onClick={onClear}
      >
        Clear filters
      </button>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div
      className="results-grid"
      aria-label="Loading AI products"
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="skeleton-card" key={index} aria-hidden="true">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-domain" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-short" />
          <div className="skeleton-card-bottom" />
        </div>
      ))}
    </div>
  );
}
