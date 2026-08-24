import type { UploadStep } from "@/lib/mock-data";

const barColor: Record<UploadStep["state"], string> = {
  complete: "bg-success",
  active: "bg-brass",
  pending: "bg-hairline-subtle",
};

const labelColor: Record<UploadStep["state"], string> = {
  complete: "text-secondary font-normal",
  active: "text-secondary font-medium",
  pending: "text-muted font-normal",
};

export default function ProcessingStepper({
  filename,
  stepIndex,
  totalSteps,
  steps,
}: {
  filename: string;
  stepIndex: number;
  totalSteps: number;
  steps: UploadStep[];
}) {
  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-[18px] rounded-md border border-hairline-subtle bg-surface px-6 py-5">
      <div className="flex w-full items-center gap-3">
        <p className="flex-1 min-w-px font-ui text-sm font-semibold text-primary">
          {filename}
        </p>
        <p className="shrink-0 font-mono text-[11px] whitespace-nowrap text-brass">
          Step {stepIndex} of {totalSteps}
        </p>
      </div>

      <div className="flex w-full items-start">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex h-[10px] flex-1 min-w-px flex-col items-start gap-2"
          >
            <div className={`h-1 w-full shrink-0 rounded-sm ${barColor[step.state]}`} />
            <p className={`w-full font-ui text-[11px] ${labelColor[step.state]}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
