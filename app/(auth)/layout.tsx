export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full w-full flex-1 items-center justify-center bg-base px-6 py-12">
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  );
}
