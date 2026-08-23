"use client";

import { useCallback, useEffect, useState } from "react";
import { PaperPanel } from "@/components/PaperPanel";
import { ProjectPanel } from "@/components/ProjectPanel";
import * as api from "@/lib/api";
import type { Paper, Project } from "@/types/api";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPapers = useCallback(async (projectId: string) => {
    try {
      setPapers(await api.listPapers(projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  // Papers are fetched from the events that change the selection rather than
  // from an effect watching it, so there is no render-then-fetch cascade.
  useEffect(() => {
    (async () => {
      try {
        const found = await api.listProjects();
        setProjects(found);
        if (found.length > 0) {
          setSelectedId(found[0].id);
          await refreshPapers(found[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshPapers]);

  // Derived rather than stored, so switching projects cannot flash the
  // previous project's papers while the new list is in flight.
  const visiblePapers = papers.filter((p) => p.project_id === selectedId);

  async function handleSelect(projectId: string) {
    setSelectedId(projectId);
    await refreshPapers(projectId);
  }

  async function handleCreate(name: string, description: string) {
    setError(null);
    try {
      const created = await api.createProject(name, description);
      setProjects((prev) => [created, ...prev]);
      setSelectedId(created.id);
      await refreshPapers(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleUpload(file: File) {
    if (!selectedId) return;
    setError(null);
    try {
      await api.uploadPaper(selectedId, file);
      await refreshPapers(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Research Intelligence
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Phase 1 · Sprint 1 — upload and storage only. No retrieval yet.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 font-medium underline"
          >
            dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="grid gap-12 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <ProjectPanel
            projects={projects}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreate={handleCreate}
          />
          <PaperPanel
            papers={visiblePapers}
            disabled={!selectedId}
            onUpload={handleUpload}
          />
        </div>
      )}
    </main>
  );
}
