import type { PaperStatus } from "@/lib/mock-data";

const statusConfig: Record<PaperStatus, { label: string; text: string; border: string; dot: string }> = {
  ready: { label: "Ready", text: "text-success", border: "border-success", dot: "bg-success" },
  processing: { label: "Processing", text: "text-warning", border: "border-warning", dot: "bg-warning" },
  failed: { label: "Failed", text: "text-error", border: "border-error", dot: "bg-error" },
};

export default function StatusBadge({ status }: { status: PaperStatus }) {
  const config = statusConfig[status];

  return (
    <div
      className={`flex shrink-0 items-center gap-[5px] rounded-full border px-2 py-1 ${config.border}`}
    >
      <span className={`size-[5px] shrink-0 rounded-full ${config.dot}`} />
      <p className={`font-mono text-[10px] whitespace-nowrap ${config.text}`}>
        {config.label}
      </p>
    </div>
  );
}
