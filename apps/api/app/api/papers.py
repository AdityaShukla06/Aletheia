import hashlib
from uuid import UUID, uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.session import get_connection
from app.schemas.models import Paper, PaperWithJob, ProcessingJob
from app.services.pdf_validation import PdfValidationError, validate_pdf
from app.services.storage import StorageError, build_storage

router = APIRouter(tags=["papers"])
log = get_logger(__name__)

PAPER_COLUMNS = """
    id, project_id, title, filename, storage_path, sha256,
    page_count, status, created_at, processed_at
"""


def _project_exists(conn, project_id: UUID) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM projects WHERE id = %s", (str(project_id),))
        return cur.fetchone() is not None


@router.post(
    "/projects/{project_id}/papers",
    response_model=PaperWithJob,
    status_code=status.HTTP_201_CREATED,
)
async def upload_paper(
    project_id: UUID, file: UploadFile = File(...)
) -> PaperWithJob:
    """Accept a PDF, store it, and open a processing job for it.

    Sprint 1 stops here: the job is created in 'pending' and nothing consumes
    it. Extraction is Sprint 2.
    """
    settings = get_settings()
    filename = file.filename or "upload.pdf"

    data = await file.read()
    try:
        validate_pdf(
            filename=filename,
            content_type=file.content_type,
            data=data,
            max_bytes=settings.max_upload_bytes,
        )
    except PdfValidationError as exc:
        log.warning("Rejected upload %r for project %s: %s", filename, project_id, exc)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    with get_connection() as conn:
        if not _project_exists(conn, project_id):
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"No project {project_id}")

    # Hash is stored because papers.sha256 is a Sprint 1 column. Duplicate
    # detection using it is Sprint 2 and is deliberately not implemented.
    sha256 = hashlib.sha256(data).hexdigest()

    paper_id = uuid4()
    key = f"{project_id}/{paper_id}.pdf"
    storage = build_storage(settings)

    try:
        storage_path = storage.store(key=key, data=data)
    except StorageError as exc:
        log.error("Storage write failed for project %s: %s", project_id, exc)
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, f"Could not store file: {exc}"
        ) from exc

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    INSERT INTO papers
                        (id, project_id, filename, storage_path, sha256, status)
                    VALUES (%s, %s, %s, %s, %s, 'uploaded')
                    RETURNING {PAPER_COLUMNS}
                    """,
                    (str(paper_id), str(project_id), filename, storage_path, sha256),
                )
                paper_row = cur.fetchone()

                cur.execute(
                    """
                    INSERT INTO processing_jobs (paper_id, status, stage)
                    VALUES (%s, 'pending', 'queued')
                    RETURNING id, paper_id, status, stage, progress, error,
                              created_at, updated_at
                    """,
                    (str(paper_id),),
                )
                job_row = cur.fetchone()
            conn.commit()
    except Exception as exc:
        # The file is already on disk but has no record pointing at it. Say so
        # loudly rather than leaving a silent orphan.
        log.error(
            "Upload rolled back for project %s; orphaned stored file at %r: %s",
            project_id,
            key,
            exc,
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not record the uploaded paper.",
        ) from exc

    log.info(
        "Stored paper %s (%r, %d bytes) in project %s; job %s pending",
        paper_id,
        filename,
        len(data),
        project_id,
        job_row["id"],
    )
    return PaperWithJob(**paper_row, job=ProcessingJob(**job_row))


@router.get("/projects/{project_id}/papers", response_model=list[PaperWithJob])
def list_papers(project_id: UUID) -> list[PaperWithJob]:
    with get_connection() as conn:
        if not _project_exists(conn, project_id):
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"No project {project_id}")

        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT {PAPER_COLUMNS}
                FROM papers WHERE project_id = %s
                ORDER BY created_at DESC
                """,
                (str(project_id),),
            )
            papers = cur.fetchall()

            if not papers:
                return []

            # Latest job per paper.
            cur.execute(
                """
                SELECT DISTINCT ON (paper_id)
                    id, paper_id, status, stage, progress, error,
                    created_at, updated_at
                FROM processing_jobs
                WHERE paper_id = ANY(%s)
                ORDER BY paper_id, created_at DESC
                """,
                ([str(p["id"]) for p in papers],),
            )
            jobs = {str(row["paper_id"]): ProcessingJob(**row) for row in cur.fetchall()}

    return [PaperWithJob(**p, job=jobs.get(str(p["id"]))) for p in papers]


@router.get("/papers/{paper_id}", response_model=PaperWithJob)
def get_paper(paper_id: UUID) -> PaperWithJob:
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(
            f"SELECT {PAPER_COLUMNS} FROM papers WHERE id = %s", (str(paper_id),)
        )
        paper = cur.fetchone()
        if paper is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"No paper {paper_id}")

        cur.execute(
            """
            SELECT id, paper_id, status, stage, progress, error,
                   created_at, updated_at
            FROM processing_jobs
            WHERE paper_id = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (str(paper_id),),
        )
        job_row = cur.fetchone()

    return PaperWithJob(**paper, job=ProcessingJob(**job_row) if job_row else None)
