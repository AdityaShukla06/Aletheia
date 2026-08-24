import type { SearchResult } from "@/lib/mock-data";

export default function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-2.5 rounded-md border border-hairline-subtle bg-surface px-6 py-5">
      <div className="flex w-full items-center gap-3">
        <p className="flex-1 min-w-px font-display text-lg font-semibold text-primary">
          {result.title}
        </p>
        <div className="shrink-0 rounded-full border border-brass px-2.5 py-1">
          <p className="font-mono text-[10px] whitespace-nowrap text-brass">
            {result.matchScore}% match
          </p>
        </div>
      </div>

      <p className="font-ui text-xs text-secondary">{result.authors}</p>

      <p className="w-full font-reading text-sm text-secondary">{result.excerpt}</p>
    </div>
  );
}
