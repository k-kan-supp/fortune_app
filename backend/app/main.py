from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, fortune, matching, profile
from app.core.config import settings
from app.core.i18n import resolve_lang, translate
from app.core.logging import configure_logging
from app.core.middleware import RequestLoggingMiddleware
from app.services.images import InvalidImageError

configure_logging()

app = FastAPI(title="四柱推命 API / Four Pillars API", version="0.1.0")


@app.exception_handler(InvalidImageError)
async def invalid_image_handler(request: Request, exc: InvalidImageError) -> JSONResponse:
    """画像エラーは、どのエンドポイントでも 400 + 翻訳済みの detail で返す。"""
    lang = resolve_lang(request.headers.get("accept-language"))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": translate(exc.key, lang)},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)
# CORS より後に足すと外側に入るので、CORS が弾いた分もログに残る
app.add_middleware(RequestLoggingMiddleware)

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
