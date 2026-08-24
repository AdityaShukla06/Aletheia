"use client";

import { useState } from "react";
import SearchResultCard from "@/components/SearchResultCard";
import { searchResults } from "@/lib/mock-data";

const filterChips = ["Semantic", "By claim", "By author", "Sort: Relevance"];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(normalizedQuery) ||
          result.authors.toLowerCase().includes(normalizedQuery) ||
          result.excerpt.toLowerCase().includes(normalizedQuery)
      )
    : searchResults;

  return (
    <div className="flex w-full flex-col items-start gap-8">
      <h1 className="font-display text-3xl font-semibold text-primary">Semantic search</h1>

      <div className="flex w-full shrink-0 items-center gap-2.5 rounded-lg border border-brass bg-surface px-5 py-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="papers that challenge the scaling hypothesis for reasoning"
          className="min-w-px flex-1 bg-transparent font-ui text-[15px] text-primary placeholder:text-muted focus:outline-none"
        />
        <p className="shrink-0 font-mono text-[11px] whitespace-nowrap text-brass">↵ Search</p>
      </div>

      <div className="flex shrink-0 items-start gap-2">
        {filterChips.map((chip, index) => (
          <div
            key={chip}
            className={`shrink-0 rounded-full px-[14px] py-[7px] ${
              index === 0 ? "bg-brass" : "border border-hairline"
            }`}
          >
            <p
              className={`font-ui text-xs font-medium whitespace-nowrap ${
                index === 0 ? "text-base" : "text-secondary"
              }`}
            >
              {chip}
            </p>
          </div>
        ))}
      </div>

      <p className="shrink-0 font-ui text-xs text-muted">
        {results.length} result{results.length === 1 ? "" : "s"}, ranked by semantic relevance
      </p>

      <div className="flex w-full shrink-0 flex-col items-start gap-4">
        {results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
        {results.length === 0 && (
          <p className="font-ui text-sm text-muted">No results match your search.</p>
        )}
      </div>
    </div>
  );
}
