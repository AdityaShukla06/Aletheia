"""Swappable AI provider interfaces (PRD Section 6).

SIGNATURES ONLY — no implementations, and nothing in Sprint 1 calls these.
They exist so later sprints have a fixed seam to implement against:

    Sprint 2  DocumentParser      (PyMuPDF)
    Sprint 3  EmbeddingProvider
    Sprint 4  LLMProvider, RerankerProvider

Adding a real implementation here before its sprint is phase bleeding.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ParsedPage:
    page_number: int
    text: str


@dataclass(frozen=True)
class RerankedChunk:
    chunk_id: str
    score: float


class DocumentParser(Protocol):
    """Sprint 2. Keeps PyMuPDF swappable."""

    def parse(self, *, data: bytes) -> list[ParsedPage]: ...

    def page_count(self, *, data: bytes) -> int: ...


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
