# Project Progress Log — AI Research Intelligence Platform

Shared status file for coordinating Claude Code (repo/backend execution) and Claude Cowork (planning/docs/research) on this project. Whoever touches this project next — either tool, either session — should read this file first and update it before signing off.

## Current phase / sprint
Phase 1, **Sprint 3 (chunking + embeddings) — code complete and verified end to end** as of 2026-08-24. Sprint 4 (RAG) not started.

**Verified working** (each actually run):
- **91/91 tests passing** (54 at end of Sprint 2), and passing in a clean venv built only from `requirements.txt`.
- **Test isolation fixed:** the suite creates and migrates its own `research_intelligence_test` database via the same migration runner as the app. Confirmed dev data is untouched after a full run.
- Chunking: token-bounded, paragraph-aware, sentence-granular overlap, section attribution, offsets into the page. Chunks never span pages, so a citation always resolves to one page (PRD 5.2).
- All three PRD §3.2 benchmark sizes (400 / 600 / 800) are usable and covered by a parametrized test — the reason the model was switched.
- Embeddings: real model, 512-dim, L2-normalized, deterministic for identical input; related text scores above unrelated.
- Token counting uses the model's own tokenizer and reflects subword splits, so chunk budgets mean what they say.
- **Retrieval verified semantically, not just structurally:** a three-topic corpus returns the correct page for each of three distinct queries, and on real papers ResNet content ranks 0.83–0.89 while an unrelated filler document ranks 0.65–0.69.
- Search scoped to its project; reprocess does not duplicate chunks; every stored chunk has a vector, a model name, and a resolvable page.
- Verified in a browser end to end, including the ranked result list with section and page attribution.

**Not yet confirmed / deliberately absent:** no reranking, context builder, evidence IDs, LLM calls, or grounded answers — all Sprint 4. Supabase still unwired. No auth. Retrieval quality has **not** been measured against a benchmark; PRD §12 still requires that, and the benchmark is a Sprint 6 deliverable (unresolved sequencing gap, below).

Sprint 2 archived at `tasks/sprint-2.md`; Sprint 3 record at `tasks/todo.md`.

### Sprint 3 decisions (resolved 2026-08-24, both were blocking)
- **Embeddings: local via `fastembed`** (ONNX, offline, no API key, no spend, real embeddings runnable in CI). Hosted providers stay a config swap behind `EmbeddingProvider`.
- **Test isolation: fixed this sprint.** Tests move to their own database instead of sharing the app's and mutating real rows.

### ⚠️ Model choice changed from what was proposed — PRD §3.2 forced it
Proposed `BAAI/bge-small-en-v1.5` (384-dim). **Rejected after checking the actual model limits: it truncates at 512 input tokens.** PRD §3.2 commits to benchmarking chunk sizes of **400 / 600 / 800 tokens** — with a 512-token model, the 600 and 800 arms would be silently truncated and produce meaningless benchmark numbers that still look successful. That is exactly the "never silently swallow" failure the PRD warns against.

**Using `jinaai/jina-embeddings-v2-small-en` instead: 512-dim, 8192-token context, 120MB.** It covers all three benchmark arms with headroom. Verified working on this Python 3.14 venv: loads in ~25s, embeds in ~0.01s, returns L2-normalized vectors (so cosine is the right pgvector index).

*Consequence:* `paper_chunks.embedding` is fixed at **512 dimensions**. Changing the model later means re-embedding every chunk, so the chunk rows record which model produced them.

*Also checked and rejected:* `all-MiniLM-L6-v2` truncates at only **256** tokens — worse for this purpose than either.

**Token counting uses the embedding model's own tokenizer**, not `tiktoken`. `tiktoken` is OpenAI's BPE and would miscount for this model, and chunk sizes must be measured in the tokens the model actually sees.

## Previous sprint
Phase 1, **Sprint 2 (PDF processing) — code complete and verified end to end** as of 2026-08-24. Sprint 1 archived at `tasks/sprint-1.md`; Sprint 2 record at `tasks/todo.md`. Sprint 3 (chunking + embeddings) is not started.

**Verified working** (each actually run, not assumed):
- **54/54 backend tests passing** (15 at end of Sprint 1).
- Extraction end to end in a browser: upload → background extraction → `ready`, with page count, title, and authors populated from the PDF.
- Page boundaries and reading order preserved; verified by reading extracted text against the source, not just by assertion.
- De-hyphenation correct in both directions: `break-\nthroughs` → `breakthroughs`, while `state-\nof-the-art` keeps its real hyphen.
- Section detection with correct nesting (`3.1` renders as level 2 under `3 Methods`) and correct page attribution; running headers are not counted as repeat sections.
- Duplicate re-upload rejected with 409 naming the existing file; the same PDF in a different project is still accepted. Backed by `UNIQUE(project_id, sha256)`, asserted at the database level in a test.
- Failure path: corrupt PDF → job `failed` at stage `parsing`, real error shown in the UI, Retry offered, no partial pages or sections written.
- Retry works: a failed paper reprocesses to `ready`, and repeated reprocessing does not duplicate pages or sections.
- Stranded jobs recovered on startup, including papers uploaded before extraction existed.

**Not yet confirmed / deliberately absent:** Supabase still entirely unwired. No auth. No chunking, token counting, or embeddings (`paper_pages.token_count` is deliberately NULL — Sprint 3). Extraction is in-process, so it does not survive a server restart mid-run; that is the accepted tradeoff, mitigated by startup recovery rather than eliminated.

### Sprint 2 decisions (resolved 2026-08-24, both were blocking)
- **Duplicate policy: per-project, reject with 409.** Same sha256 already in the *same* project is a duplicate and is rejected, returning the existing paper's id so the UI can point at it. The same PDF in a *different* project stays a separate paper record. *Why:* global dedup would couple projects together — deleting a paper in one project would affect another, which complicates every later sprint. *How to apply:* enforced by a `UNIQUE(project_id, sha256)` constraint so the database guarantees it rather than app code alone.
- **Job execution: FastAPI BackgroundTasks, in-process.** Upload returns immediately; extraction runs after the response. *Why:* no new libraries or infrastructure beyond PRD Section 6, while keeping status visible and jobs retryable. *Known tradeoff, handled explicitly:* jobs die if the process is killed mid-run, so startup recovery marks stranded `running` jobs as failed and retryable. Revisit a real worker only if ingestion volume justifies it.

### ⚠️ Gap found in the PRD — needs a Cowork decision, not a silent patch
PRD **Section 12 requires "basic section info retained"**, but the **Section 7 schema has nowhere to put it**. The only `section` field is on `paper_chunks`, which is a Sprint 3 entity — so satisfying a Sprint 2 acceptance criterion would require writing to a Sprint 3 table, which is phase bleeding.

Proceeding with a new **`paper_sections` table** (sections span multiple pages, so hanging them off a single `paper_pages` row would be wrong). Flagging rather than quietly amending Section 7: **Section 7 should be updated to include `paper_sections` as a Phase 1 entity.**

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

## Handoff notes for Sprint 4 (RAG)
- **`POST /projects/{id}/search` already returns everything the context builder needs**: chunk id, content, section, page number, paper id/title, and similarity. Sprint 4 should rerank that candidate set down to 5–8, not re-query.
- **Do not let the LLM invent citation labels** (PRD §5.3). The evidence IDs handed to the model must be generated backend-side from the chunk ids this endpoint already returns, and resolved back through chunk → page → paper. That path is intact and tested.
- **A chunk can legitimately have `section = NULL`** — content before the first detected heading (a paper's title block, for instance). Citations must degrade to "page N" rather than rendering "null".
- **Vectors are model-specific.** Every chunk records `embedding_model`. If the model ever changes, existing vectors are invalid and must be re-embedded — comparing across models silently produces garbage rankings rather than an error. Check the column before assuming a project's vectors are comparable.
- Chunk size and overlap are `CHUNK_MAX_TOKENS` / `CHUNK_OVERLAP_TOKENS` in settings, and all three PRD §3.2 sizes are supported. Changing either requires reprocessing papers to take effect.
- Ingestion is still in-process (`BackgroundTasks`) and now does real model work. It is fast locally with a cached model, but Sprint 4's LLM calls are a good moment to revisit the worker decision.
- The embedding model loads lazily and takes ~25s on the very first call in a fresh process (cached thereafter). The first request after an API restart pays that cost.

## Known unresolved issues in the PRD (flagged during Cowork review)
- Section 12 requires retrieval to be "measurable against benchmark data" before Phase 2 starts, but the benchmark (Sprint 6) is scheduled after the sprints that criterion gates. Needs a decision: pull a rough benchmark earlier, or treat the criterion as unenforceable until Sprint 6.
- Phase 6 ("reproducibility scoring, AI peer review") has not been confirmed as trained-model-based vs. heuristic/prompted. This determines whether any model training work is in scope at all, and if so, which dataset tier (S2ORC / PMC) applies. Currently unresolved — do not start pulling large training corpora until this is answered.

## Datasets — status
- Ingestion corpus (Sprint 1-5, any real PDFs): not yet pulled. See `docs/dataset-references.md` for sourcing links (arXiv bulk data is the primary candidate — matches the PyMuPDF extraction requirement).
- Sprint 6 benchmark (~10 papers × 15 questions, hand-built): not started, blocked on having an ingestion corpus first.
- LitQA2 / PaperQA2 data: reference-only for Section 3 related work — explicitly NOT to be reused as the Sprint 6 benchmark.
- Training-scale corpus (S2ORC / PMC): on hold pending the Phase 6 scope decision above.

## Log
- **2026-08-24** — **Sprint 3 complete, 91/91 tests passing**, verified in a clean venv built only from `requirements.txt`. Frontend gained a semantic search panel showing ranked passages with section, page, and similarity. Verified in a browser against the two real dev papers: ResNet content ranks 0.83–0.89 for a residual-connections query while an unrelated filler document ranks 0.65–0.69, so the ordering is genuinely semantic rather than incidental. **A caution worth recording:** an early check of `paper_chunks` showed zero rows and briefly looked like embeddings were not running — it was the test fixture's cascade delete at teardown. Counting rows *after* a suite run proves nothing; assert inside the test.
- **2026-08-24** — **Sprint 3 backend complete: 91/91 tests passing** (54 at end of Sprint 2). Test isolation fixed first — the suite now creates and migrates its own `research_intelligence_test` database using the same migration runner as the app, so it can no longer mutate dev data (verified: dev rows untouched after a full run). Migration `0004` pins `paper_chunks.embedding` to `vector(512)`, adds an HNSW cosine index, and records `embedding_model`/`embedded_at` per chunk so a model swap is detectable rather than silently mixing vector spaces. Chunker is section/paragraph-aware, token-bounded, with sentence-granular overlap; chunks never span pages so a citation always resolves to one page (PRD 5.2). Ingestion gained `chunking` and `embedding` stages, batched at 32. `POST /projects/{id}/search` does semantic top-k. **Retrieval verified semantically, not just structurally** — a three-topic corpus returns the correct page for each of three distinct queries. Frontend not updated yet at time of writing.
- **2026-08-24** — **Sprint 3 opened.** Reread PROGRESS.md first (no Cowork changes since `72c0eeb`; the PRD §7 `paper_sections` gap flagged in Sprint 2 is still open on their side). Verified `fastembed` and `tiktoken` resolve on Python 3.14 before planning around them. Both blocking decisions resolved. **Caught a model/PRD conflict before writing any code:** the proposed embedding model truncates at 512 tokens while PRD §3.2 commits to benchmarking 600- and 800-token chunks — switched models rather than ship a benchmark that silently truncates two of its three arms. Details above.
- **2026-08-24** — **Sprint 2 complete, 54/54 tests passing.** Frontend updated: live status polling (only while a job is actually in flight), page counts, expandable section outline with nesting, per-paper error display, and a Retry button. **Two further bugs found by verifying rather than reviewing:** (1) papers uploaded before extraction existed sat at `pending` forever with no recovery path and caused the UI to poll indefinitely — startup recovery now also strands `pending` jobs, and Retry is offered for them; (2) **normalization destroyed every paragraph break** — PDFs pad "blank" lines with spaces, and single newlines were collapsed to spaces *before* that padding was trimmed, so `\n\n` never formed. This would have left Sprint 3's paragraph-aware chunker with no boundaries to chunk on. Fixed by trimming whitespace around line breaks first; confirmed on a real PDF (page 1 went from 0 to 2 paragraph breaks) and covered by a regression test.
- **2026-08-24** — **Sprint 2 backend complete: 52/52 tests passing** (was 15 at end of Sprint 1). Migration `0003` adds `paper_sections`, `UNIQUE(project_id, sha256)`, and job retry columns. `PyMuPDFParser` implements the widened `DocumentParser`; extraction runs as a background task and writes pages, sections, and metadata. Added `GET /papers/{id}/pages`, `GET /papers/{id}/sections`, `POST /papers/{id}/reprocess`, plus startup recovery for jobs stranded by a restart. **Three bugs found by tests, all real:** (1) section detection ran on normalized text, but normalization collapses the newlines that make a heading identifiable — detection now reads raw text and resolves offsets into cleaned text; (2) abstract extraction had the same root cause and is now derived from detected section boundaries; (3) de-hyphenation turned `state-\nof-the-art` into `stateof-the-art` because the greedy quantifier backtracked to a partial word. Frontend not updated yet at time of writing.
- **2026-08-24** — **Sprint 2 opened.** Reread PROGRESS.md first (no Cowork changes since 2026-08-23). Confirmed PyMuPDF 1.28.2 installs and imports on this Python 3.14 venv before planning around it. Restored the stack after an overnight restart — Docker volume persisted, migrations still applied, Sprint 1 data intact. Both blocking Sprint 2 decisions resolved (see above). Sprint 1 plan archived to `tasks/sprint-1.md`; `tasks/todo.md` is now the Sprint 2 plan. **Flagged a PRD schema gap** (Section 12 needs section storage that Section 7 does not define) — see above; Cowork should update Section 7.
- **2026-08-23** — PRD reviewed and cleaned up into `PRD.md`. Sequencing gap in Section 12 flagged. Sprint 1 Claude Code prompt drafted. Dataset sourcing links researched and compiled. Folder seeded for Code/Cowork coordination.
- **2026-08-23** — Sprint 1 prompt updated to require Claude Code to read `PROGRESS.md`/`PRD.md` first and update `PROGRESS.md` continuously (not just at session end) as it works. Prompt finalized at `claude_code_sprint1_prompt.md` and ready to hand off.
- **2026-08-23** — Closed the matching gap on the Cowork side: added a binding rule (above) that any Cowork session reads this file first by default, not only when the user asks. Going forward, Cowork should re-fetch this file before any Sprint 2+ planning, dataset guidance, or PRD changes.
- **2026-08-23** — **Sprint 1 complete.** Frontend built (Next.js 16 / React 19 / Tailwind v4) and the whole §11.1 flow verified in a browser against the running backend. Two fixes found by verification rather than by review: (1) the psycopg pool handed out connections killed by a DB restart, failing every request for ~20s — now checks connections on checkout and recovers immediately; (2) ESLint's `set-state-in-effect` caught a render-then-fetch cascade on the papers list — restructured to fetch from the selection events instead, and the visible list is now derived so switching projects cannot flash the previous project's papers. Repo initialized with git; `.env`, `storage/`, `node_modules/`, `.venv/` confirmed excluded. **Committed** on `main` as `17b5a0e` (initial commit, 60 files) after a content-level secret scan, not just a filename check — the only credential in the tree is the throwaway local docker-compose Postgres password that pairs with `.env.example`. No remote is configured and nothing has been pushed.
- **2026-08-23** — **Backend + database complete and verified.** docker-compose Postgres 17 + pgvector healthy on host port 5433. Both migrations applied and confirmed idempotent on re-run; all 10 tables present, `vector` and `pgcrypto` extensions enabled. FastAPI serves `/health` (reports real DB + storage reachability, 503 when degraded), projects create/list/get, PDF upload, and paper status. **15/15 backend tests passing.** Frontend not started yet at time of writing.
- **2026-08-23** — **Claude Code session opened Sprint 1.** Read PRD, PROGRESS, and dataset-references in full before writing code. Both Section 11.2 blocking questions resolved (clean start; local Postgres + pgvector first). Four execution-level decisions recorded above. Sprint 1 plan written to `tasks/todo.md`. Scaffolding started — see that file for live per-deliverable status. The two non-blocking PRD issues (Section 12 benchmark sequencing gap, Phase 6 training-vs-heuristic scope) remain OPEN and untouched; neither gates Sprint 1.

---
*Update this file whenever you complete work, hit a blocker, or make a decision — either tool, either session.*
