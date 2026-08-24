# AI Research Intelligence Platform

Multimodal research-paper understanding, built phase by phase from a text-RAG foundation.
See [PRD.md](PRD.md) for scope and [PROGRESS.md](PROGRESS.md) for live project state.

> **Current state: Phase 1, Sprint 2 (PDF processing).**
> Upload, storage, and text extraction — pages, metadata, and detected sections.
> No chunking, embeddings, retrieval, or LLM calls; those are Sprints 3–4 and are
> deliberately not implemented.

## Prerequisites

Docker, Python 3.12+, Node 20+.

## Running it

Sprint 1 runs against local Postgres + pgvector. Supabase is not wired up yet — that decision
and its rationale are recorded in [PROGRESS.md](PROGRESS.md).

**1. Configure**

```bash
cp .env.example .env
```

The defaults work with the bundled docker-compose. No secrets are needed for Sprint 1.

**2. Start the database**

```bash
docker compose up -d
```

**3. Install backend dependencies and migrate**

```bash
python3 -m venv .venv && ./.venv/bin/pip install -r apps/api/requirements.txt
```

```bash
./.venv/bin/python scripts/migrate.py
```

`scripts/migrate.py --status` shows what has and hasn't been applied. Re-running is safe.

**4. Start the API**

```bash
cd apps/api && ../../.venv/bin/python -m uvicorn main:app --reload --port 8000
```

Interactive API docs at http://localhost:8000/docs.

**5. Start the frontend**

```bash
npm install --prefix apps/web && npm run dev --prefix apps/web
```

Open http://localhost:3000, create a project, and upload a PDF.

## Tests

```bash
cd apps/api && ../../.venv/bin/python -m pytest
```

Tests run against the same local Postgres and create/clean up their own rows, so the
database must be up and migrated first.

## Layout

```
apps/api/          FastAPI backend
  app/api/         Route handlers (health, projects, papers)
  app/core/        Config and logging
  app/db/          Connection pool
  app/schemas/     Pydantic models
  app/services/    Storage, PDF validation, AI provider interfaces (stubs)
  migrations/      Numbered SQL, applied by scripts/migrate.py
  tests/
apps/web/          Next.js frontend
docs/              Architecture notes and dataset references
scripts/           Operational scripts
storage/           Uploaded PDFs (git-ignored, created at runtime)
```

## API

| Endpoint | Purpose |
|---|---|
| `GET /health` | Reports real database and storage reachability; 503 when degraded |
| `POST /projects` · `GET /projects` · `GET /projects/{id}` | Create and select projects |
| `POST /projects/{id}/papers` | Validate a PDF, store it, and queue extraction. 409 if that PDF is already in the project |
| `GET /projects/{id}/papers` · `GET /papers/{id}` | Papers with their latest job status |
| `GET /papers/{id}/pages` | Extracted page text, in page order |
| `GET /papers/{id}/sections` | Detected sections, in document order |
| `POST /papers/{id}/reprocess` | Retry extraction for a failed or stranded paper |

### How extraction runs

Upload returns immediately and extraction runs in-process as a FastAPI background task,
walking the job through `downloading → parsing → persisting → complete`. Because it is
in-process, it does not survive a server restart mid-run — on startup, any job left
`running` or `pending` is marked failed with an explanation and can be retried from the UI.

## Notes for the next sprint

- `app/services/providers.py` holds the provider interfaces. `DocumentParser` is
  implemented (`parsing.py`, the only module importing PyMuPDF); `EmbeddingProvider`,
  `RerankerProvider`, and `LLMProvider` remain signature-only until Sprints 3–4.
- **Chunk from `paper_pages.cleaned_text`.** Paragraph breaks (`\n\n`) survive
  normalization and are the natural boundary. The ordering of steps in
  `normalization.py` is load-bearing for this — a regression test guards it.
- `paper_sections.start_offset` indexes into that page's `cleaned_text`, and is NULL
  when the heading could not be relocated. Handle the NULL.
- `paper_pages.token_count` is deliberately NULL — token counting is Sprint 3 and needs
  a tokenizer choice first.
- `paper_chunks.embedding` has no dimensionality or ANN index yet; both wait until the
  embedding model is chosen.
- Tests currently share this database. Point them at a separate one before the suite grows.
