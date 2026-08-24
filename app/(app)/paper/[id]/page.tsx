import Link from "next/link";
import ReadingPane from "@/components/ReadingPane";
import ExtractionPanel from "@/components/ExtractionPanel";
import { mockReaderPaper } from "@/lib/mock-data";

export default async function PaperReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  const paper = mockReaderPaper;

  return (
    <div className="-mx-10 -my-8 flex h-full w-full flex-1 flex-col items-start">
      <div className="flex w-full shrink-0 items-center gap-3 border-b border-hairline-subtle px-10 py-[18px]">
        <Link href="/library" className="shrink-0 font-ui text-xs whitespace-nowrap text-muted hover:text-secondary">
          Library
        </Link>
        <span className="shrink-0 font-ui text-xs text-muted">/</span>
        <p className="flex-1 min-w-px truncate font-ui text-xs font-medium text-primary">
          {paper.title}
        </p>
      </div>

      <div className="flex w-full flex-1 min-h-px items-start">
        <ReadingPane paper={paper} />
        <ExtractionPanel extraction={paper.extraction} />
      </div>
    </div>
  );
}
