function Field({ label, value, grow }: { label: string; value: string; grow?: boolean }) {
  return (
    <div className={`flex shrink-0 flex-col items-start gap-1 ${grow ? "min-w-px flex-1" : ""}`}>
      <p className="font-mono text-[10px] tracking-[0.6px] whitespace-nowrap text-muted">
        {label}
      </p>
      <p className="font-ui text-[13px] font-medium whitespace-nowrap text-primary">{value}</p>
    </div>
  );
}

export default function RepoMetadataCard({
  repository,
  commit,
  environment,
  lastVerified,
}: {
  repository: string;
  commit: string;
  environment: string;
  lastVerified: string;
}) {
  return (
    <div className="flex w-full shrink-0 items-center gap-6 rounded-md border border-hairline-subtle bg-surface px-6 py-5">
      <Field label="REPOSITORY" value={repository} grow />
      <Field label="COMMIT" value={commit} />
      <Field label="ENVIRONMENT" value={environment} />
      <Field label="LAST VERIFIED" value={lastVerified} />
    </div>
  );
}
