"use client";

import { useState } from "react";
import type { AIProvider } from "@/lib/mock-data";

export default function ProviderSelector({
  providers,
  defaultProviderId,
}: {
  providers: AIProvider[];
  defaultProviderId: string;
}) {
  const [selectedId, setSelectedId] = useState(defaultProviderId);
  const [isOpen, setIsOpen] = useState(false);

  const selected = providers.find((p) => p.id === selectedId) ?? providers[0];

  return (
    <div className="relative w-full shrink-0">
      <div className="flex w-full items-center gap-4 rounded-md border border-brass bg-surface px-[18px] py-4">
        <span className="size-2 shrink-0 rounded-full bg-brass" />
        <p className="min-w-px flex-1 font-ui text-sm font-medium text-primary">
          {selected.label}
        </p>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="shrink-0 font-ui text-xs font-medium whitespace-nowrap text-brass"
        >
          Change ›
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 flex flex-col items-start gap-px overflow-hidden rounded-md border border-hairline-subtle bg-surface shadow-lg">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => {
                setSelectedId(provider.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-[18px] py-3 text-left transition-colors hover:bg-surface-raised ${
                provider.id === selectedId ? "bg-surface-raised" : ""
              }`}
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  provider.id === selectedId ? "bg-brass" : "bg-hairline"
                }`}
              />
              <p className="font-ui text-sm text-primary">{provider.label}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
