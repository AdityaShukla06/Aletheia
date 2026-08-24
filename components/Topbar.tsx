export default function Topbar() {
  return (
    <header className="flex w-full shrink-0 items-center gap-5 border-b border-hairline-subtle px-10 py-5">
      <div className="flex flex-1 min-w-px items-center rounded-md border border-hairline bg-surface px-[14px] py-[9px]">
        <p className="font-ui text-[13px] text-muted whitespace-nowrap">
          Search papers, authors, claims…
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-[6px] rounded-full border border-brass bg-surface px-3 py-[7px]">
        <span className="size-[6px] shrink-0 rounded-full bg-brass" />
        <p className="font-mono text-[11px] text-brass whitespace-nowrap">
          2 processing
        </p>
      </div>

      <div className="size-[34px] shrink-0 rounded-full bg-surface-raised border border-hairline" />
    </header>
  );
}
