export type BadgeTone = "success" | "warning" | "error" | "muted";

const toneConfig: Record<BadgeTone, { text: string; border: string; dot: string }> = {
  success: { text: "text-success", border: "border-success", dot: "bg-success" },
  warning: { text: "text-warning", border: "border-warning", dot: "bg-warning" },
  error: { text: "text-error", border: "border-error", dot: "bg-error" },
  muted: { text: "text-muted", border: "border-muted", dot: "bg-muted" },
};

export default function Badge({ tone, label }: { tone: BadgeTone; label: string }) {
  const config = toneConfig[tone];

  return (
    <div
      className={`flex shrink-0 items-center gap-[5px] rounded-full border px-2 py-1 ${config.border}`}
    >
      <span className={`size-[5px] shrink-0 rounded-full ${config.dot}`} />
      <p className={`font-mono text-[10px] whitespace-nowrap ${config.text}`}>{label}</p>
    </div>
  );
}
