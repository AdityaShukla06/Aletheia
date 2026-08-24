import Dropzone from "@/components/Dropzone";
import ProcessingStepper from "@/components/ProcessingStepper";
import { currentUpload, recentUploads, type RecentUploadStatus } from "@/lib/mock-data";

const statusText: Record<RecentUploadStatus, string> = {
  ready: "Ready",
  failed: "Failed · retry",
  processing: "Processing",
};

const statusColor: Record<RecentUploadStatus, string> = {
  ready: "text-success",
  failed: "text-error",
  processing: "text-warning",
};

export default function UploadPage() {
  return (
    <div className="flex w-full flex-col items-start gap-8">
      <h1 className="font-display text-3xl font-semibold text-primary">
        Upload a paper
      </h1>

      <Dropzone />

      <ProcessingStepper
        filename={currentUpload.filename}
        stepIndex={currentUpload.stepIndex}
        totalSteps={currentUpload.totalSteps}
        steps={currentUpload.steps}
      />

      <p className="font-ui text-base font-semibold text-primary">Recently added</p>

      <div className="flex w-full shrink-0 flex-col items-start gap-px bg-base">
        {recentUploads.map((upload) => (
          <div
            key={upload.id}
            className="flex w-full items-center gap-3 bg-surface px-4 py-[14px]"
          >
            <p className="flex-1 min-w-px font-mono text-xs text-primary">
              {upload.filename}
            </p>
            <p className="shrink-0 font-ui text-[11px] whitespace-nowrap text-muted">
              {upload.size}
            </p>
            <p
              className={`shrink-0 font-ui text-[11px] font-medium whitespace-nowrap ${statusColor[upload.status]}`}
            >
              {statusText[upload.status]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
