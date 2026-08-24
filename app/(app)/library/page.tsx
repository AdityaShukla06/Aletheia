import PaperCard from "@/components/PaperCard";
import { papers } from "@/lib/mock-data";

export default function LibraryPage() {
  const readyCount = papers.filter((p) => p.status === "ready").length;
  const processingCount = papers.filter((p) => p.status === "processing").length;
  const failedCount = papers.filter((p) => p.status === "failed").length;

  const chips = [
    { label: "All", count: papers.length, active: true },
    { label: "Ready", count: readyCount, active: false },
    { label: "Processing", count: processingCount, active: false },
    { label: "Failed", count: failedCount, active: false },
  ];

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex w-full items-center gap-4">
        <h1 className="flex-1 font-display text-3xl font-semibold text-primary">
          Library
        </h1>
        <button
          type="button"
          className="shrink-0 rounded-md bg-oxblood px-[18px] py-[10px] font-ui text-[13px] font-semibold text-primary"
        >
          + Upload paper
        </button>
      </div>

      <div className="flex shrink-0 items-start gap-2">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className={`shrink-0 rounded-full px-[14px] py-[7px] ${
              chip.active
                ? "bg-brass"
                : "border border-hairline"
            }`}
          >
            <p
              className={`font-ui text-xs font-medium whitespace-nowrap ${
                chip.active ? "text-base" : "text-secondary"
              }`}
            >
              {chip.label} · {chip.count}
            </p>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-wrap items-start gap-x-5 gap-y-5">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
