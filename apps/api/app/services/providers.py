"""Swappable AI/parsing provider interfaces (PRD Section 6).

    Sprint 2  DocumentParser      -- implemented (PyMuPDF), see parsing.py
    Sprint 3  EmbeddingProvider   -- signature only
    Sprint 4  LLMProvider, RerankerProvider -- signatures only

`DocumentParser` was widened in Sprint 2: the Sprint 1 stub returned only page
text, but extraction also has to yield metadata and detected sections, and
doing that in one pass avoids opening the document three times. The unimplemented
interfaces below remain signature-only — filling them in before their sprint is
phase bleeding.
"""

from dataclasses import dataclass, field
from typing import Protocol


class ParserError(RuntimeError):
    """A document could not be parsed. Always surfaced onto the job, never swallowed."""


@dataclass(frozen=True)
class ParsedPage:
    page_number: int  # 1-based
    raw_text: str
    cleaned_text: str


@dataclass(frozen=True)
class DetectedSection:
    title: str
    level: int
    section_index: int
    start_page: int  # 1-based
    start_offset: int | None = None


@dataclass(frozen=True)
class DocumentMetadata:
    page_count: int
    title: str | None = None
    authors: list[str] = field(default_factory=list)
    abstract: str | None = None


@dataclass(frozen=True)
class ParsedDocument:
    metadata: DocumentMetadata
    pages: list[ParsedPage]
    sections: list[DetectedSection]


class DocumentParser(Protocol):
    """Sprint 2. Keeps PyMuPDF swappable."""

    def parse(self, *, data: bytes) -> ParsedDocument:
        """Parse a document. Raises ParserError on anything unreadable."""


@dataclass(frozen=True)
class RerankedChunk:
    chunk_id: str
    score: float


class EmbeddingProvider(Protocol):
    """Sprint 3."""

    @property
    def dimensions(self) -> int: ...

    def embed(self, *, texts: list[str]) -> list[list[float]]: ...


class RerankerProvider(Protocol):
    """Sprint 4."""

    def rerank(
        self, *, query: str, chunks: list[tuple[str, str]], top_k: int
    ) -> list[RerankedChunk]: ...


class LLMProvider(Protocol):
    """Sprint 4. Answers are built from supplied evidence only (PRD 5.3/5.4)."""

    def complete(self, *, system: str, prompt: str) -> str: ...
