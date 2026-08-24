import type { BadgeTone } from "@/components/Badge";

const fillColor: Record<BadgeTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  muted: "bg-muted",
};

export default function ConfidenceMeter({
  confidence,
  tone,
}: {
  confidence: number;
  tone: BadgeTone;
}) {
  return (
    <div className="flex min-w-px flex-1 shrink-0 items-center gap-2">
      <div className="relative h-1.5 w-[220px] shrink-0 overflow-hidden rounded-sm bg-surface-raised">
        {confidence > 0 ? (
          <div
            className={`absolute inset-y-0 left-0 rounded-sm ${fillColor[tone]}`}
            style={{ width: `${confidence}%` }}
          />
        ) : (
          <span className={`absolute inset-y-0 left-0 my-auto size-1.5 rounded-sm ${fillColor[tone]}`} />
        )}
      </div>
      <p className="shrink-0 font-mono text-[11px] whitespace-nowrap text-muted">
        {confidence}% confidence
      </p>
    </div>
  );
}
