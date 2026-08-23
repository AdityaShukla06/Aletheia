import os
import tempfile
from collections.abc import Iterator

import pytest

# Point storage at a throwaway directory before any app module reads settings.
# Env vars take precedence over .env in pydantic-settings.
_TMP_STORAGE = tempfile.mkdtemp(prefix="ri-test-storage-")
os.environ["LOCAL_STORAGE_DIR"] = _TMP_STORAGE

from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.db.session import get_connection  # noqa: E402
from main import app  # noqa: E402

# A minimal but genuinely valid PDF: correct header, one page, valid xref.
MINIMAL_PDF = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF
"""


@pytest.fixture(scope="session")
def client() -> Iterator[TestClient]:
    with TestClient(app) as c:
        yield c


@pytest.fixture
def project(client: TestClient) -> Iterator[dict]:
    response = client.post(
        "/projects", json={"name": "Test Project", "description": "created by tests"}
    )
    assert response.status_code == 201, response.text
    created = response.json()

    yield created

    # Papers and jobs cascade from the project.
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM projects WHERE id = %s", (created["id"],))
        conn.commit()


@pytest.fixture
def storage_root():
    return get_settings().storage_root
