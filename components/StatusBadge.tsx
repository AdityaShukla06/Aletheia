import Badge, { type BadgeTone } from "@/components/Badge";
import type { PaperStatus } from "@/lib/mock-data";

const statusConfig: Record<PaperStatus, { label: string; tone: BadgeTone }> = {
  ready: { label: "Ready", tone: "success" },
  processing: { label: "Processing", tone: "warning" },
  failed: { label: "Failed", tone: "error" },
};

export default function StatusBadge({ status }: { status: PaperStatus }) {
  const config = statusConfig[status];
  return <Badge tone={config.tone} label={config.label} />;
}
