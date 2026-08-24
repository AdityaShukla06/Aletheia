export default function SignInPage() {
  return (
    <div className="flex w-full flex-col items-start gap-7 rounded-lg border border-hairline bg-surface p-12">
      <div className="h-[2px] w-12 shrink-0 bg-brass" />

      <div className="flex w-full flex-col items-start gap-1.5">
        <p className="font-mono text-[11px] tracking-[1.32px] text-brass">
          THE ARCHIVE
        </p>
        <h1 className="font-display text-[26px] font-black text-primary">
          Sign in to your archive
        </h1>
      </div>

      <div className="flex w-full flex-col items-start gap-2">
        <label htmlFor="email" className="font-ui text-xs font-medium text-secondary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@institution.edu"
          className="w-full rounded-md border border-hairline bg-base px-[14px] py-3 font-ui text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-brass"
        />
      </div>

      <div className="flex w-full flex-col items-start gap-2">
        <label htmlFor="password" className="font-ui text-xs font-medium text-secondary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••••••"
          className="w-full rounded-md border border-hairline bg-base px-[14px] py-3 font-ui text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-brass"
        />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center rounded-md bg-oxblood py-[13px] font-ui text-sm font-semibold text-primary"
      >
        Sign in
      </button>

      <div className="flex w-full items-start justify-center gap-1 font-ui text-xs">
        <span className="text-muted">New here?</span>
        <span className="font-semibold text-brass">Request access</span>
      </div>
    </div>
  );
}
