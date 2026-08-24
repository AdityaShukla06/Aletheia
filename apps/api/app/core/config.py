from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[4]

# Sprint 1 has no auth. Seeded by migration 0002.
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=REPO_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    storage_backend: str = "local"
    local_storage_dir: str = "storage"
    max_upload_bytes: int = 50 * 1024 * 1024
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000"

    # Chunking. PRD Section 3.2 commits to benchmarking 400 / 600 / 800 tokens,
    # so these are configuration, not constants. 600 is a mid-range starting
    # point, not a measured result.
    chunk_max_tokens: int = 600
    chunk_overlap_tokens: int = 80

    # How many chunks a search returns before Sprint 4 adds reranking.
    search_top_k: int = 20

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "papers"

    api_host: str = "0.0.0.0"
    api_port: int = 8000

    dev_user_id: str = Field(default=DEV_USER_ID)

    @property
    def storage_root(self) -> Path:
        path = Path(self.local_storage_dir)
        return path if path.is_absolute() else REPO_ROOT / path

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    # Missing DATABASE_URL raises here rather than failing at first query.
    return Settings()
