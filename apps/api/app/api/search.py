from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.session import get_connection
from app.schemas.models import SearchRequest, SearchResult
from app.services.embedding import EmbeddingError, build_embedding_provider

router = APIRouter(tags=["search"])
log = get_logger(__name__)


@router.post("/projects/{project_id}/search", response_model=list[SearchResult])
def search(project_id: UUID, payload: SearchRequest) -> list[SearchResult]:
    """Semantic retrieval over a project's chunks.

    Sprint 3 stops at semantic similarity. Reranking down to the top 5-8
    evidence chunks is Sprint 4 (PRD 5.1 step 7), so this returns the wider
    candidate set that reranking will later consume.
    """
    settings = get_settings()
    top_k = payload.top_k or settings.search_top_k

    with get_connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM projects WHERE id = %s", (str(project_id),))
        if cur.fetchone() is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"No project {project_id}")

    try:
        provider = build_embedding_provider()
        # The query goes through the same model as the documents — comparing
        # vectors from different models would be meaningless.
        query_vector = provider.embed(texts=[payload.query])[0]
    except EmbeddingError as exc:
        log.error("Could not embed query for project %s: %s", project_id, exc)
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, f"Could not embed the query: {exc}"
        ) from exc

    with get_connection() as conn, conn.cursor() as cur:
        # <=> is cosine distance in pgvector; similarity is 1 - distance.
        # Page and section travel with the row so a citation can resolve to
        # "Section 3.2, page 7" without a second query (PRD 5.2).
        cur.execute(
            """
            SELECT c.id            AS chunk_id,
                   c.paper_id,
                   c.content,
                   c.section,
                   c.chunk_index,
                   c.token_count,
                   pg.page_number,
                   p.title         AS paper_title,
                   p.filename,
                   1 - (c.embedding <=> %s::vector) AS similarity
              FROM paper_chunks c
              JOIN papers p       ON p.id = c.paper_id
         LEFT JOIN paper_pages pg ON pg.id = c.page_id
             WHERE p.project_id = %s
               AND c.embedding IS NOT NULL
          ORDER BY c.embedding <=> %s::vector
             LIMIT %s
            """,
            (str(query_vector), str(project_id), str(query_vector), top_k),
        )
        rows = cur.fetchall()

    log.info(
        "Search in project %s returned %d chunk(s) for %r",
        project_id,
        len(rows),
        payload.query[:60],
    )
    return [SearchResult(**row) for row in rows]
