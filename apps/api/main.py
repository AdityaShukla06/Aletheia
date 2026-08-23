from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import health, papers, projects
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.session import close_pool

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings.log_level)
    settings.storage_root.mkdir(parents=True, exist_ok=True)
    log.info("API starting — storage=%s", settings.storage_backend)
    yield
    close_pool()
    log.info("API stopped")


app = FastAPI(
    title="AI Research Intelligence Platform API",
    version="0.1.0",
    description="Phase 1, Sprint 1 — foundation only. No RAG logic.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Log the full trace; return something a client can act on. Never silent.
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500, content={"detail": "Internal server error."}
    )


app.include_router(health.router)
app.include_router(projects.router)
app.include_router(papers.router)
