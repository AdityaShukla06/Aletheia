"use client";

import { useRef, useState } from "react";
import type { Paper } from "@/types/api";
import { StatusBadge } from "./StatusBadge";

interface Props {
  papers: Paper[];
  disabled: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function PaperPanel({ papers, disabled, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Cheap client-side check for immediate feedback. The backend validates
    // properly (magic bytes); this is not the security boundary.
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setLocalError("Only .pdf files can be uploaded.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Papers
        </h2>
        <label
          className={`cursor-pointer rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium dark:border-neutral-700 ${
            disabled || uploading
              ? "pointer-events-none opacity-40"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          {uploading ? "Uploading…" : "Upload PDF"}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={disabled || uploading}
            onChange={handleFile}
          />
        </label>
      </div>

      {localError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {localError}
        </p>
      )}

      {disabled ? (
        <p className="text-sm text-neutral-500">
          Select a project to upload papers into it.
        </p>
      ) : papers.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No papers in this project yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {papers.map((paper) => (
            <li
              key={paper.id}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {paper.title ?? paper.filename}
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500">
                  {paper.sha256 ? `sha256 ${paper.sha256.slice(0, 12)}…` : "—"}
                </p>
              </div>
              <StatusBadge paper={paper} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
