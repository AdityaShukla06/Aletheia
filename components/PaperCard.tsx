import StatusBadge from "@/components/StatusBadge";
import type { Paper } from "@/lib/mock-data";

export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="flex w-[410px] shrink-0 flex-col items-start gap-[14px] rounded-md border border-hairline-subtle bg-surface p-5">
      <div className="flex w-full items-start gap-2">
        <StatusBadge status={paper.status} />
        <p className="font-ui text-[11px] whitespace-nowrap text-muted">{paper.date}</p>
      </div>

      <p className="w-full font-display text-[17px] font-semibold text-primary">
        {paper.title}
      </p>

      <p className="w-full font-ui text-xs text-secondary">{paper.authors}</p>

      <div className="flex shrink-0 items-start gap-1.5">
        {paper.tags.map((tag) => (
          <div
            key={tag}
            className="shrink-0 rounded-[3px] bg-surface-raised px-2 py-[3px]"
          >
            <p className="font-mono text-[9px] whitespace-nowrap text-secondary">{tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
