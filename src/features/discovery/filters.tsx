"use client";

import {
  Bot,
  Code2,
  Image,
  Mic,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Video,
  Workflow,
  X,
} from "lucide-react";
import {
  categories,
  quickCategories,
  sources,
  sorts,
} from "@/lib/freeserp/options";
import type { SearchFilters } from "@/lib/freeserp/types";
import { useState } from "react";

const icons = {
  agents: Bot,
  code: Code2,
  automation: Workflow,
  image: Image,
  video: Video,
  voice: Mic,
  chatbots: MessageSquare,
  search: Search,
};

export function QuickCategories({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}) {
  return (
    <div className="quick-categories" aria-label="Popular categories">
      {quickCategories.map((id) => {
        const category = categories.find((item) => item.id === id)!;
        const Icon = icons[id as keyof typeof icons];
        return (
          <button
            type="button"
            aria-pressed={filters.category === id}
            key={id}
            className={`category-chip ${filters.category === id ? "is-active" : ""}`}
            onClick={() =>
              onChange({
                ...filters,
                category: filters.category === id ? "" : id,
              })
            }
          >
            <Icon size={14} aria-hidden="true" />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export function Filters({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const update = (key: keyof SearchFilters, value: string) =>
    onChange({ ...filters, [key]: value });
  const activeCount = [
    filters.category,
    filters.source,
    filters.dr,
    filters.days,
  ].filter(Boolean).length;
  return (
    <div className="filter-section">
      <button
        className="mobile-filter-toggle button button-secondary"
        type="button"
        aria-expanded={expanded}
        aria-controls="discovery-filters"
        onClick={() => setExpanded(!expanded)}
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        Filters
        {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
        <span>{expanded ? "Hide" : "Show"}</span>
      </button>
      <div
        id="discovery-filters"
        className={`filter-grid ${expanded ? "is-expanded" : ""}`}
      >
        <label>
          Category
          <select
            value={filters.category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Technology / builder
          <select
            value={filters.source}
            onChange={(event) => update("source", event.target.value)}
          >
            <option value="">Any technology</option>
            {sources.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Domain Rating
          <select
            value={filters.dr}
            onChange={(event) => update("dr", event.target.value)}
          >
            <option value="">Any rating</option>
            {[10, 20, 30, 50].map((rating) => (
              <option key={rating} value={rating}>
                {rating}+
              </option>
            ))}
          </select>
        </label>
        <label>
          First confirmed live
          <select
            value={filters.days}
            onChange={(event) => update("days", event.target.value)}
          >
            <option value="">Any time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
        <label>
          Sort by
          <select
            value={filters.sort}
            onChange={(event) => update("sort", event.target.value)}
          >
            {sorts.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function ActiveFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
}) {
  const chips: { key: keyof SearchFilters; label: string }[] = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` });
  if (filters.category)
    chips.push({
      key: "category",
      label: categories.find((item) => item.id === filters.category)!.label,
    });
  if (filters.source)
    chips.push({
      key: "source",
      label: sources.find((item) => item.value === filters.source)!.label,
    });
  if (filters.dr) chips.push({ key: "dr", label: `DR ${filters.dr}+` });
  if (filters.days)
    chips.push({ key: "days", label: `Last ${filters.days} days` });
  if (!chips.length) return null;
  return (
    <div className="active-filters">
      {chips.map((chip) => (
        <button
          type="button"
          key={chip.key}
          onClick={() => onChange({ ...filters, [chip.key]: "" })}
          aria-label={`Remove ${chip.label} filter`}
        >
          {chip.label}
          <X size={12} aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        className="clear-filters"
        onClick={onClear}
      >
        Clear all
      </button>
    </div>
  );
}
