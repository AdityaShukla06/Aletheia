# AI Research Intelligence Platform

Multimodal research-paper understanding, built phase by phase from a text-RAG foundation.
See [PRD.md](PRD.md) for scope and [PROGRESS.md](PROGRESS.md) for live project state.

> **Current state: Phase 1, Sprint 1 (Foundation).**
> Upload and storage only. No text extraction, chunking, embeddings, retrieval, or LLM calls —
> those are Sprints 2–4 and are deliberately not implemented.

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

## What Sprint 1 covers

| Endpoint | Purpose |
|---|---|
| `GET /health` | Reports real database and storage reachability; 503 when degraded |
| `POST /projects` · `GET /projects` · `GET /projects/{id}` | Create and select projects |
| `POST /projects/{id}/papers` | Validate a PDF, store it, create `papers` + `processing_jobs` rows |
| `GET /projects/{id}/papers` · `GET /papers/{id}` | Processing status for the UI |

Processing jobs are created in `pending` and nothing consumes them yet — the ingestion
pipeline is Sprint 2.

## Notes for the next sprint

- `app/services/providers.py` holds signature-only interfaces for `DocumentParser`,
  `EmbeddingProvider`, `RerankerProvider`, and `LLMProvider`. Implement against these
  rather than calling providers directly.
- `papers.sha256` is populated on upload, but duplicate detection using it is Sprint 2.
- `paper_pages`, `paper_chunks`, `conversations`, `messages`, and `citations` exist as
  empty table shells. `paper_chunks.embedding` has no dimensionality or ANN index yet —
  both wait until the embedding model is chosen in Sprint 3.
