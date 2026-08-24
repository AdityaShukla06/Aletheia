"use client";

import { useState, type DragEvent } from "react";

export default function Dropzone() {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex w-full shrink-0 flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 transition-colors ${
        isDragOver ? "border-brass bg-surface-raised" : "border-hairline"
      }`}
    >
      <div
        className={`size-12 shrink-0 rounded-full border-2 transition-colors ${
          isDragOver ? "border-brass-bright" : "border-brass"
        }`}
      />
      <p className="font-ui text-[15px] font-medium text-primary">
        Drag &amp; drop a PDF, or click to browse
      </p>
      <p className="font-ui text-xs text-muted">
        Single file · up to 50MB · .pdf only
      </p>
    </div>
  );
}
