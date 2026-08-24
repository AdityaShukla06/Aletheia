"use client";

import { useState } from "react";
import type { ReaderPaper } from "@/lib/mock-data";

type TabKey = "figures" | "tables" | "equations" | "citations";

const tabs: { key: TabKey; label: string }[] = [
  { key: "figures", label: "Figures" },
  { key: "tables", label: "Tables" },
  { key: "equations", label: "Equations" },
  { key: "citations", label: "Citations" },
];

function ExtractCard({ label, caption, children }: { label: string; caption: string; children?: React.ReactNode }) {
  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-2.5 rounded-md border border-hairline-subtle bg-surface-raised p-3.5">
      {children ?? <div className="h-[140px] w-full shrink-0 rounded border border-hairline-subtle bg-base" />}
      <p className="font-ui text-xs font-semibold text-brass">{label}</p>
      <p className="w-full font-ui text-xs text-secondary">{caption}</p>
    </div>
  );
}

export default function ExtractionPanel({ extraction }: { extraction: ReaderPaper["extraction"] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("figures");

  return (
    <div className="flex h-full w-[400px] shrink-0 flex-col items-start border-l border-hairline-subtle bg-surface">
      <div className="flex w-full shrink-0 items-start gap-[22px] border-b border-hairline-subtle px-6">
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="flex shrink-0 flex-col items-start gap-2 pt-4 pb-3.5"
            >
              <span
                className={`font-ui text-[13px] whitespace-nowrap ${
                  active ? "font-semibold text-primary" : "font-normal text-muted"
                }`}
              >
                {tab.label}
              </span>
              <span className={`h-[2px] w-[60px] shrink-0 ${active ? "bg-brass" : "bg-surface"}`} />
            </button>
          );
        })}
      </div>

      <div className="flex w-full flex-1 min-h-px flex-col items-start gap-5 overflow-y-auto p-6">
        {activeTab === "figures" &&
          extraction.figures.map((figure) => (
            <ExtractCard key={figure.id} label={figure.label} caption={figure.caption} />
          ))}

        {activeTab === "tables" &&
          extraction.tables.map((table) => (
            <ExtractCard key={table.id} label={table.label} caption={table.caption} />
          ))}

        {activeTab === "equations" &&
          extraction.equations.map((equation) => (
            <ExtractCard key={equation.id} label={equation.label} caption={equation.caption}>
              <div className="flex h-[70px] w-full shrink-0 items-center justify-center rounded border border-hairline-subtle bg-base px-3">
                <p className="font-mono text-sm text-primary">{equation.expression}</p>
              </div>
            </ExtractCard>
          ))}

        {activeTab === "citations" &&
          extraction.citations.map((citation) => (
            <div
              key={citation.id}
              className="flex w-full shrink-0 flex-col items-start gap-1 rounded-md border border-hairline-subtle bg-surface-raised p-3.5"
            >
              <p className="w-full font-ui text-xs font-semibold text-primary">{citation.title}</p>
              <p className="font-ui text-xs text-secondary">
                {citation.authors} · {citation.year}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
