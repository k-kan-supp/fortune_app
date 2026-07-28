from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, fortune, matching, profile
from app.core.config import settings

app = FastAPI(title="四柱推命 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(fortune.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(matching.router, prefix="/api")

# アップロードファイル（アイコン等）の配信。本番でS3等に移す場合はこのマウントを外す。
if settings.storage_backend == "local":
    upload_root = Path(settings.upload_dir)
    upload_root.mkdir(parents=True, exist_ok=True)
    app.mount(
        settings.upload_url_prefix,
        StaticFiles(directory=upload_root),
        name="uploads",
    )


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
