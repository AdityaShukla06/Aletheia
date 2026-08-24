export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="font-display text-3xl font-semibold text-primary">{title}</h1>
      <p className="font-ui text-sm text-secondary">{description}</p>
    </div>
  );
}
