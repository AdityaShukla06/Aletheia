# Project Progress Log — AI Research Intelligence Platform

Shared status file for coordinating Claude Code (repo/backend execution) and Claude Cowork (planning/docs/research) on this project. Whoever touches this project next — either tool, either session — should read this file first and update it before signing off.

## Current phase / sprint
Phase 1, Sprint 1 (Foundation) — **code complete and verified end to end** as of 2026-08-23, running on local Postgres. Sprint 2 (PDF processing) is not started and nothing from it has been implemented.

**Verified working** (not assumed — each was actually run):
- docker-compose Postgres 17 + pgvector, healthy; `vector` + `pgcrypto` extensions enabled.
- Both migrations applied; re-running is a no-op (idempotency confirmed).
- 15/15 backend tests passing.
- `/health` returns 200 when healthy and 503 with a real reason when the DB is down (tested by stopping the container).
- Full PRD §11.1 flow driven through a real browser: create project → upload a genuine 3-page 18KB PDF → `papers` row + `processing_jobs` row created → status badge rendered. Stored file confirmed **byte-identical** to the source (sha256 match).
- Rejection path: a non-PDF named `.pdf` is refused on magic bytes, the backend's own message is shown in the UI, and **no row and no file are left behind**.
- Project switching does not leak papers between projects.
- Frontend production build, TypeScript, and ESLint all clean.

**Not yet confirmed / deliberately absent:** Supabase (DB + Storage) is entirely unwired — no Supabase code path has ever been executed. Auth does not exist; every project belongs to one seeded dev user. Nothing consumes `processing_jobs`, so jobs sit in `pending` forever by design until Sprint 2.

## Coordination rule (read before touching this project)
This file is the shared source of truth between Claude Code (implementation) and Claude Cowork (planning/docs). Whichever tool touches this project — read this file first, and update it before you stop working, not just at the end of a session. Log blockers and decisions as they happen, not retroactively.

**Binding on the Cowork side specifically:** any Cowork session doing planning, review, or research on this project reads this file first, by default, without being asked — not conditional on the user remembering to say "check progress first." If this file hasn't been reread this session before giving Sprint 2+ guidance, dataset guidance, or PRD changes, that's a process failure, not an acceptable default.

## Open decisions (blocking Sprint 1 execution — see PRD Section 11.2)
- [x] **Does a repo already exist with partial work, or starting clean?** — RESOLVED 2026-08-23: **clean start.** Project folder contained only `PRD.md`, `PROGRESS.md`, `claude_code_sprint1_prompt.md`, `docs/dataset-references.md`. No `apps/`, no source code, and not a git repository. Nothing to preserve or overwrite.
- [x] **Supabase provisioned, or local Postgres + pgvector first?** — RESOLVED 2026-08-23: **local Postgres + pgvector via docker-compose first; Supabase wired in afterward.** Checked the connected Supabase account — two projects exist (`expire-x`, `tanishq1101's Project`, both ap-south-1) but neither belongs to this platform, so nothing was provisioned for it. User chose local-first. *Why:* Sprint 1 reaches a green test suite with no network dependency, no live credentials, and no billing decision; Supabase becomes a config swap later. *How to apply:* all DB/storage access sits behind a seam so the swap does not touch application logic. Migrations are written as plain SQL files so the Supabase CLI can consume them unchanged when we migrate.

### Decisions made during Sprint 1 execution
- **Repo root = the existing project folder**, not a nested `research-intelligence/` directory as drawn in PRD Section 8. *Why:* `PROGRESS.md` is specified as living at the project root and is the shared Code/Cowork source of truth; nesting the code under a subfolder would orphan it from the repo it describes. `docs/` already sits at this level. Section 8's tree is explicitly a guideline, not a mandate.
- **Storage: interface + local filesystem backend only in Sprint 1.** The Supabase Storage backend is deliberately NOT written yet. *Why:* we cannot verify it against a project that does not exist, and writing an untested implementation would violate the "never claim done without verification" principle. The interface is the seam; the Supabase backend lands when a project is provisioned.
- **Migrations: plain numbered SQL files + a small runner script**, no ORM/Alembic. *Why:* PRD Section 6 lists no migration library, four tables do not justify one, and plain SQL matches the format the Supabase CLI already consumes — making the eventual move a file move rather than a rewrite.
- **DB access: raw SQL via a Postgres driver, no ORM.** *Why:* Section 6 specifies FastAPI + Pydantic only; Sprint 1 has a handful of queries and an ORM would be over-engineering at this scope.

## Handoff notes for Sprint 2
- Implement against the interfaces in `apps/api/app/services/providers.py` (`DocumentParser` first, for PyMuPDF) rather than calling libraries directly from route handlers.
- `papers.sha256` is already populated on upload; duplicate detection using it is Sprint 2's job. `idx_papers_sha256` exists but is deliberately **not** a uniqueness constraint — decide the dedup policy (reject vs. link to existing) before making it one.
- `processing_jobs` rows are created but nothing consumes them. Sprint 2 needs to decide how jobs are run (inline vs. background worker); the `status`/`stage`/`progress`/`error` columns are already shaped for a real pipeline.
- `paper_chunks.embedding` is an unconstrained `vector` with no ANN index. Both the dimensionality and the index type should be set in Sprint 3 once the embedding model is chosen — picking either now would be guesswork.
- The frontend does not poll for status; it refetches after upload and on project switch. Polling or streaming becomes worthwhile only once jobs actually progress.

## Known unresolved issues in the PRD (flagged during Cowork review)
- Section 12 requires retrieval to be "measurable against benchmark data" before Phase 2 starts, but the benchmark (Sprint 6) is scheduled after the sprints that criterion gates. Needs a decision: pull a rough benchmark earlier, or treat the criterion as unenforceable until Sprint 6.
- Phase 6 ("reproducibility scoring, AI peer review") has not been confirmed as trained-model-based vs. heuristic/prompted. This determines whether any model training work is in scope at all, and if so, which dataset tier (S2ORC / PMC) applies. Currently unresolved — do not start pulling large training corpora until this is answered.

## Datasets — status
- Ingestion corpus (Sprint 1-5, any real PDFs): not yet pulled. See `docs/dataset-references.md` for sourcing links (arXiv bulk data is the primary candidate — matches the PyMuPDF extraction requirement).
- Sprint 6 benchmark (~10 papers × 15 questions, hand-built): not started, blocked on having an ingestion corpus first.
- LitQA2 / PaperQA2 data: reference-only for Section 3 related work — explicitly NOT to be reused as the Sprint 6 benchmark.
- Training-scale corpus (S2ORC / PMC): on hold pending the Phase 6 scope decision above.

## Log
- **2026-08-23** — PRD reviewed and cleaned up into `PRD.md`. Sequencing gap in Section 12 flagged. Sprint 1 Claude Code prompt drafted. Dataset sourcing links researched and compiled. Folder seeded for Code/Cowork coordination.
- **2026-08-23** — Sprint 1 prompt updated to require Claude Code to read `PROGRESS.md`/`PRD.md` first and update `PROGRESS.md` continuously (not just at session end) as it works. Prompt finalized at `claude_code_sprint1_prompt.md` and ready to hand off.
- **2026-08-23** — Closed the matching gap on the Cowork side: added a binding rule (above) that any Cowork session reads this file first by default, not only when the user asks. Going forward, Cowork should re-fetch this file before any Sprint 2+ planning, dataset guidance, or PRD changes.
- **2026-08-23** — **Sprint 1 complete.** Frontend built (Next.js 16 / React 19 / Tailwind v4) and the whole §11.1 flow verified in a browser against the running backend. Two fixes found by verification rather than by review: (1) the psycopg pool handed out connections killed by a DB restart, failing every request for ~20s — now checks connections on checkout and recovers immediately; (2) ESLint's `set-state-in-effect` caught a render-then-fetch cascade on the papers list — restructured to fetch from the selection events instead, and the visible list is now derived so switching projects cannot flash the previous project's papers. Repo initialized with git; `.env`, `storage/`, `node_modules/`, `.venv/` confirmed excluded. **Committed** on `main` as `17b5a0e` (initial commit, 60 files) after a content-level secret scan, not just a filename check — the only credential in the tree is the throwaway local docker-compose Postgres password that pairs with `.env.example`. No remote is configured and nothing has been pushed.
- **2026-08-23** — **Backend + database complete and verified.** docker-compose Postgres 17 + pgvector healthy on host port 5433. Both migrations applied and confirmed idempotent on re-run; all 10 tables present, `vector` and `pgcrypto` extensions enabled. FastAPI serves `/health` (reports real DB + storage reachability, 503 when degraded), projects create/list/get, PDF upload, and paper status. **15/15 backend tests passing.** Frontend not started yet at time of writing.
- **2026-08-23** — **Claude Code session opened Sprint 1.** Read PRD, PROGRESS, and dataset-references in full before writing code. Both Section 11.2 blocking questions resolved (clean start; local Postgres + pgvector first). Four execution-level decisions recorded above. Sprint 1 plan written to `tasks/todo.md`. Scaffolding started — see that file for live per-deliverable status. The two non-blocking PRD issues (Section 12 benchmark sequencing gap, Phase 6 training-vs-heuristic scope) remain OPEN and untouched; neither gates Sprint 1.

---
*Update this file whenever you complete work, hit a blocker, or make a decision — either tool, either session.*
