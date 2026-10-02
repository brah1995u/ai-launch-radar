"use client";

import { useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

export function SearchForm({
  initialQuery,
  onSearch,
}: {
  initialQuery: string;
  onSearch: (query: string) => void;
}) {
  const [draft, setDraft] = useState(initialQuery);
  return (
    <form
      className="search-form"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draft.trim());
      }}
    >
      <label className="sr-only" htmlFor="product-search">
        Search AI sites
      </label>
      <Search className="search-icon" size={21} aria-hidden="true" />
      <input
        id="product-search"
        name="q"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={300}
        autoComplete="off"
        placeholder="Search AI agents, coding tools, voice apps..."
      />
      <span className="search-key" aria-hidden="true">
        <CornerDownLeft size={13} />
      </span>
      <button className="button button-primary" type="submit">
        Search
        <ArrowSearch />
      </button>
    </form>
  );
}

function ArrowSearch() {
  return <Search size={16} className="search-button-icon" aria-hidden="true" />;
}
