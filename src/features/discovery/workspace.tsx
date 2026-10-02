"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, Layers2, LoaderCircle } from "lucide-react";
import {
  defaultFilters,
  parseFilters,
  resultsHref,
  serializeFilters,
} from "@/lib/freeserp/query";
import { mergeSites } from "@/lib/freeserp/pagination";
import type {
  SearchFilters,
  SitePage,
  SitesResponse,
} from "@/lib/freeserp/types";
import { CompareBar } from "@/features/compare/compare-controls";
import { SearchForm } from "./search-form";
import { ActiveFilters, Filters, QuickCategories } from "./filters";
import { SiteCard } from "./site-card";
import { EmptyResults, ResultsSkeleton, SearchError } from "./states";

interface Props {
  initialFilters: SearchFilters;
  initialPage: SitePage | null;
  initialError: string | null;
}
interface ResultState {
  key: string;
  page: SitePage | null;
  error: string | null;
  busy: boolean;
}

async function fetchPage(
  filters: SearchFilters,
  from: number,
  signal: AbortSignal,
): Promise<SitePage> {
  const params = serializeFilters(filters);
  params.set("from", String(from));
  const fallback = "The data source may be temporarily unavailable.";
  let response: Response;
  let body: SitesResponse;
  try {
    response = await fetch(`/api/sites?${params}`, { signal });
    body = await response.json();
  } catch {
    throw new Error(fallback);
  }
  if (!body || typeof body.ok !== "boolean") throw new Error(fallback);
  if (!response.ok || !body.ok)
    throw new Error(
      !body.ok && typeof body.error?.message === "string"
        ? body.error.message
        : fallback,
    );
  if (
    !body.data ||
    !Array.isArray(body.data.sites) ||
    typeof body.data.total !== "number"
  ) {
    throw new Error(fallback);
  }
  return body.data;
}

export function DiscoveryWorkspace({
  initialFilters,
  initialPage,
  initialError,
}: Props) {
  const searchParams = useSearchParams();
  const filters = parseFilters(new URLSearchParams(searchParams.toString()));
  const key = serializeFilters(filters).toString();
  const [state, setState] = useState<ResultState>({
    key: serializeFilters(initialFilters).toString(),
    page: initialPage,
    error: initialError,
    busy: false,
  });
  const [retry, setRetry] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const lastRequest = useRef(`${serializeFilters(initialFilters)}:0`);
  const generation = useRef(0);
  const moreController = useRef<AbortController | null>(null);
  const requestLock = useRef(false);
  const loading = state.key !== key || state.busy;
  const returnTo = resultsHref(filters);

  useEffect(() => {
    const token = `${key}:${retry}`;
    if (lastRequest.current === token) return;
    lastRequest.current = token;
    moreController.current?.abort();
    requestLock.current = false;
    const controller = new AbortController();
    const currentGeneration = ++generation.current;
    const activeFilters = parseFilters(new URLSearchParams(key));
    fetchPage(activeFilters, 0, controller.signal)
      .then((page) => {
        if (
          !controller.signal.aborted &&
          generation.current === currentGeneration
        ) {
          setState({ key, page, error: null, busy: false });
          setMoreError(null);
          setLoadingMore(false);
        }
      })
      .catch((error: unknown) => {
        if (
          !controller.signal.aborted &&
          generation.current === currentGeneration
        ) {
          setState({
            key,
            page: null,
            error:
              error instanceof Error
                ? error.message
                : "The data source may be temporarily unavailable.",
            busy: false,
          });
          setLoadingMore(false);
        }
      });
    return () => controller.abort();
  }, [key, retry]);

  useEffect(
    () => () => {
      moreController.current?.abort();
    },
    [],
  );

  function changeFilters(next: SearchFilters) {
    if (serializeFilters(next).toString() === key) return;
    // Invalidate pending work immediately, before React processes the URL update.
    generation.current++;
    moreController.current?.abort();
    window.history.pushState(null, "", resultsHref(next));
  }

  function retrySearch() {
    setState({ key, page: null, error: null, busy: true });
    setRetry((value) => value + 1);
  }

  async function loadMore() {
    if (requestLock.current || loading || state.page?.nextFrom == null) return;
    requestLock.current = true;
    setLoadingMore(true);
    setMoreError(null);
    const controller = new AbortController();
    moreController.current = controller;
    const currentGeneration = generation.current;
    try {
      const page = await fetchPage(
        filters,
        state.page.nextFrom,
        controller.signal,
      );
      if (controller.signal.aborted || generation.current !== currentGeneration)
        return;
      setState((previous) =>
        previous.key === key && previous.page
          ? {
              ...previous,
              page: {
                ...page,
                sites: mergeSites(previous.page.sites, page.sites),
              },
            }
          : previous,
      );
    } catch (error) {
      if (
        !controller.signal.aborted &&
        generation.current === currentGeneration
      )
        setMoreError(
          error instanceof Error
            ? error.message
            : "Couldn’t load more products. Please try again.",
        );
    } finally {
      if (generation.current === currentGeneration) {
        requestLock.current = false;
        setLoadingMore(false);
      }
    }
  }

  return (
    <>
      <section
        className="discovery-panel"
        aria-label="Search and filter AI products"
      >
        <SearchForm
          key={filters.q}
          initialQuery={filters.q}
          onSearch={(q) => changeFilters({ ...filters, q })}
        />
        <QuickCategories filters={filters} onChange={changeFilters} />
        <Filters filters={filters} onChange={changeFilters} />
      </section>
      <section
        className="results-section"
        aria-labelledby="results-heading"
        aria-busy={loading}
      >
        <div className="results-heading">
          <div>
            <span className="section-icon">
              <Layers2 size={18} aria-hidden="true" />
            </span>
            <h2 id="results-heading">
              {filters.q ||
              filters.category ||
              filters.source ||
              filters.dr ||
              filters.days
                ? "Discovery results"
                : "On the radar"}
            </h2>
            <span className="results-total" role="status">
              {loading
                ? "Searching…"
                : state.page
                  ? `${state.page.total.toLocaleString("en")} matches`
                  : ""}
            </span>
          </div>
          <p>Compare up to 3 products</p>
        </div>
        <ActiveFilters filters={filters} onChange={changeFilters} />
        {loading ? (
          <ResultsSkeleton />
        ) : state.error ? (
          <SearchError message={state.error} onRetry={retrySearch} />
        ) : !state.page?.sites.length ? (
          <EmptyResults
            onClear={() => {
              if (key === "") retrySearch();
              else changeFilters({ ...defaultFilters });
            }}
          />
        ) : (
          <>
            <div className="results-grid">
              {state.page.sites.map((site) => (
                <SiteCard key={site.domain} site={site} returnTo={returnTo} />
              ))}
            </div>
            <div className="load-more-area">
              <p>
                Showing {state.page.sites.length} of{" "}
                {state.page.total.toLocaleString("en")} matching sites
              </p>
              {moreError && (
                <p className="load-more-error" role="alert">
                  {moreError}
                </p>
              )}
              {state.page.nextFrom !== null ? (
                <button
                  type="button"
                  disabled={loadingMore}
                  className="button button-secondary load-more-button"
                  onClick={loadMore}
                >
                  {loadingMore ? (
                    <LoaderCircle
                      size={16}
                      className="spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowDown size={16} aria-hidden="true" />
                  )}
                  {loadingMore
                    ? "Loading more…"
                    : moreError
                      ? "Try loading more again"
                      : "Load more"}
                </button>
              ) : (
                <span className="end-of-results">
                  {state.page.total > 10_000
                    ? "Discovery window reached. Narrow your filters to explore further."
                    : "You’ve reached the end of these results."}
                </span>
              )}
            </div>
          </>
        )}
      </section>
      <CompareBar returnTo={returnTo} />
    </>
  );
}
