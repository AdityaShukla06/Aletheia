import { Fragment } from "react";
import type { ReaderPaper } from "@/lib/mock-data";

export default function ReadingPane({ paper }: { paper: ReaderPaper }) {
  return (
    <div className="flex h-full min-w-px flex-1 flex-col items-start gap-[18px] overflow-y-auto px-16 py-12">
      <p className="shrink-0 font-mono text-[10px] tracking-[0.8px] whitespace-nowrap text-brass">
        {paper.category}
      </p>

      <h1 className="w-full shrink-0 font-display text-3xl font-black text-primary">
        {paper.title}
      </h1>

      <p className="shrink-0 font-ui text-xs text-secondary whitespace-pre">
        {paper.authors}  —  {paper.affiliation}
      </p>

      {paper.sections.map((section) => (
        <Fragment key={section.heading}>
          <p className="shrink-0 font-ui text-[13px] font-semibold text-brass">
            {section.heading}
          </p>
          <p
            className={`w-full font-reading text-base ${
              section.emphasis ? "text-primary" : "text-secondary"
            }`}
          >
            {section.body}
          </p>
        </Fragment>
      ))}
    </div>
  );
}
