from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class Project(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: str | None
    created_at: datetime


class ProcessingJob(BaseModel):
    id: UUID
    paper_id: UUID
    status: str
    stage: str | None
    progress: float
    error: str | None
    attempts: int = 0
    created_at: datetime
    updated_at: datetime


class PaperPage(BaseModel):
    id: UUID
    paper_id: UUID
    page_number: int
    cleaned_text: str | None
    character_count: int | None


class PaperSection(BaseModel):
    id: UUID
    paper_id: UUID
    title: str
    level: int
    section_index: int
    start_page: int
    start_offset: int | None


class Paper(BaseModel):
    id: UUID
    project_id: UUID
    title: str | None
    filename: str
    storage_path: str
    sha256: str | None
    page_count: int | None
    status: str
    created_at: datetime
    processed_at: datetime | None


class PaperWithJob(Paper):
    job: ProcessingJob | None = None


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    top_k: int | None = Field(default=None, ge=1, le=100)


class SearchResult(BaseModel):
    chunk_id: UUID
    paper_id: UUID
    paper_title: str | None
    filename: str
    content: str
    section: str | None
    chunk_index: int
    token_count: int | None
    page_number: int | None
    similarity: float


class HealthResponse(BaseModel):
    status: str
    database: str
    storage: str
