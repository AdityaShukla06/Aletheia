"""Sprint 2 ingestion pipeline: stored PDF -> pages, sections, metadata.

Runs as a FastAPI background task (decision recorded in PROGRESS.md). Every
failure lands on the job as a readable error so it is diagnosable and
retryable, per PRD Section 12. Nothing here is allowed to raise into the
caller — a background task that throws would vanish silently.

Not in scope: chunking, token counting, embeddings (Sprint 3).
"""

from uuid import UUID

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.session import get_connection
from app.services.parsing import build_parser
from app.services.providers import ParsedDocument, ParserError
from app.services.storage import StorageError, build_storage

log = get_logger(__name__)

# (stage name, progress when that stage completes)
STAGE_DOWNLOAD = ("downloading", 0.1)
STAGE_PARSE = ("parsing", 0.5)
STAGE_PERSIST = ("persisting", 0.9)
STAGE_DONE = ("complete", 1.0)


def _set_stage(conn, job_id: UUID, stage: str, progress: float) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE processing_jobs
               SET stage = %s, progress = %s, status = 'running', updated_at = now()
             WHERE id = %s
            """,
            (stage, progress, str(job_id)),
        )
    conn.commit()


def _fail(job_id: UUID, paper_id: UUID, message: str) -> None:
    """Record a failure on both the job and the paper. Never silent."""
    log.error("Ingestion failed for paper %s: %s", paper_id, message)
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE processing_jobs
                       SET status = 'failed', error = %s,
                           updated_at = now(), finished_at = now()
                     WHERE id = %s
                    """,
                    (message, str(job_id)),
                )
                cur.execute(
                    "UPDATE papers SET status = 'failed' WHERE id = %s",
                    (str(paper_id),),
                )
            conn.commit()
    except Exception:
        # If we cannot even record the failure, make sure it is in the log.
        log.exception("Could not record failure for paper %s", paper_id)


def _persist(conn, paper_id: UUID, parsed: ParsedDocument) -> None:
    """Write pages, sections, and metadata in a single transaction.

    Deletes any prior extraction first so a reprocess is idempotent rather than
    accumulating duplicate pages.
    """
    with conn.cursor() as cur:
        cur.execute("DELETE FROM paper_pages WHERE paper_id = %s", (str(paper_id),))
        cur.execute("DELETE FROM paper_sections WHERE paper_id = %s", (str(paper_id),))

        for page in parsed.pages:
            cur.execute(
                """
                INSERT INTO paper_pages
                    (paper_id, page_number, raw_text, cleaned_text, character_count)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    str(paper_id),
                    page.page_number,
                    page.raw_text,
                    page.cleaned_text,
                    len(page.cleaned_text),
                ),
            )
            # token_count is deliberately left NULL — token counting is a
            # Sprint 3 deliverable.

        for section in parsed.sections:
            cur.execute(
                """
                INSERT INTO paper_sections
                    (paper_id, title, level, section_index, start_page, start_offset)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    str(paper_id),
                    section.title,
                    section.level,
                    section.section_index,
                    section.start_page,
                    section.start_offset,
                ),
            )

        meta = parsed.metadata
        cur.execute(
            """
            UPDATE papers
               SET page_count = %s,
                   -- Keep a title the user already has if the PDF has none.
                   title = COALESCE(%s, title),
                   authors = %s,
                   abstract = COALESCE(%s, abstract),
                   status = 'ready',
                   processed_at = now()
             WHERE id = %s
            """,
            (
                meta.page_count,
                meta.title,
                meta.authors or None,
                meta.abstract,
                str(paper_id),
            ),
        )


def process_paper(paper_id: UUID, job_id: UUID) -> None:
    """Run one paper through extraction. Safe to call as a background task."""
    settings = get_settings()

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE processing_jobs
                       SET status = 'running', stage = %s, progress = %s,
                           attempts = attempts + 1, error = NULL,
                           started_at = now(), finished_at = NULL, updated_at = now()
                     WHERE id = %s
                    """,
                    (STAGE_DOWNLOAD[0], STAGE_DOWNLOAD[1], str(job_id)),
                )
                cur.execute(
                    "UPDATE papers SET status = 'processing' WHERE id = %s",
                    (str(paper_id),),
                )
                cur.execute(
                    "SELECT storage_path FROM papers WHERE id = %s", (str(paper_id),)
                )
                row = cur.fetchone()
            conn.commit()

        if row is None:
            _fail(job_id, paper_id, "Paper record disappeared before processing.")
            return

        storage_path = row["storage_path"]
    except Exception as exc:
        _fail(job_id, paper_id, f"Could not start processing: {exc}")
        return

    # --- read the file ---
    try:
        data = build_storage(settings).read(key=storage_path)
    except StorageError as exc:
        _fail(job_id, paper_id, f"Stored file could not be read: {exc}")
        return

    # --- parse ---
    try:
        with get_connection() as conn:
            _set_stage(conn, job_id, *STAGE_PARSE)
        parsed = build_parser().parse(data=data)
    except ParserError as exc:
        _fail(job_id, paper_id, str(exc))
        return
    except Exception as exc:
        # A parser bug must surface on the job, not disappear into the void.
        log.exception("Unexpected parser error for paper %s", paper_id)
        _fail(job_id, paper_id, f"Unexpected error while parsing: {exc}")
        return

    # --- persist ---
    try:
        with get_connection() as conn:
            _set_stage(conn, job_id, *STAGE_PERSIST)
            _persist(conn, paper_id, parsed)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE processing_jobs
                       SET status = 'succeeded', stage = %s, progress = %s,
                           error = NULL, updated_at = now(), finished_at = now()
                     WHERE id = %s
                    """,
                    (STAGE_DONE[0], STAGE_DONE[1], str(job_id)),
                )
            conn.commit()
    except Exception as exc:
        log.exception("Could not persist extraction for paper %s", paper_id)
        _fail(job_id, paper_id, f"Could not save extracted content: {exc}")
        return

    log.info(
        "Processed paper %s: %d pages, %d sections",
        paper_id,
        len(parsed.pages),
        len(parsed.sections),
    )


def recover_stranded_jobs() -> int:
    """Fail jobs no live process is working on, so they become retryable.

    The chosen in-process execution model (PROGRESS.md) cannot survive a
    restart. At boot there are by definition no in-flight background tasks, so
    any job still 'running' died mid-run, and any job still 'pending' was never
    picked up — including papers uploaded before extraction existed. Both are
    stranded forever otherwise: without this they would sit in the UI showing
    perpetual progress with no way to recover them.
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE processing_jobs
                       SET status = 'failed',
                           error = CASE status
                               WHEN 'running' THEN
                                   'Processing was interrupted by a server restart. Retry to reprocess.'
                               ELSE
                                   'Processing never started before the server restarted. Retry to process.'
                           END,
                           updated_at = now(), finished_at = now()
                     WHERE status IN ('running', 'pending')
                 RETURNING paper_id
                    """
                )
                stranded = [r["paper_id"] for r in cur.fetchall()]
                if stranded:
                    cur.execute(
                        "UPDATE papers SET status = 'failed' WHERE id = ANY(%s)",
                        ([str(p) for p in stranded],),
                    )
            conn.commit()
        if stranded:
            log.warning("Recovered %d job(s) stranded by a restart.", len(stranded))
        return len(stranded)
    except Exception:
        log.exception("Could not run stranded-job recovery")
        return 0
