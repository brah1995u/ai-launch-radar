"use client";

import { AlertCircle } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container short-page" id="main-content">
      <div className="result-state" role="alert">
        <span className="state-icon state-error">
          <AlertCircle aria-hidden="true" />
        </span>
        <h1>Something interrupted this page.</h1>
        <p>Please try loading it again.</p>
        <button type="button" className="button button-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
