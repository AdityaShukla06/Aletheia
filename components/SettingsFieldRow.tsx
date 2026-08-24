export default function SettingsFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full shrink-0 items-center gap-4 bg-surface px-[18px] py-3.5">
      <p className="min-w-px flex-1 font-ui text-[13px] text-secondary">{label}</p>
      <p className="shrink-0 font-mono text-xs whitespace-nowrap text-primary">{value}</p>
    </div>
  );
}
