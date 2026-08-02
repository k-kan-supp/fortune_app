import logging
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import analytics, auth, fortune, matching, profile
from app.core.config import settings
from app.core.i18n import resolve_lang, translate
from app.core.logging import configure_logging
from app.core.middleware import RequestLoggingMiddleware
from app.core.ratelimit import RateLimitMiddleware
from app.services.images import InvalidImageError

configure_logging()

logger = logging.getLogger("app.startup")

app = FastAPI(title="四柱推命 API / Four Pillars API", version="0.1.0")

# 「どの設定で動いているのか」を最初の1行で確定させる。
# 障害時にまず疑うのがここなので、秘密値は載せず効いている設定だけを出す。
logger.info(
    "starting",
    extra={
        "env": settings.app_env,
        "log_level": settings.log_level.upper(),
        "storage": settings.storage_backend,
        "email": settings.email_backend,
    },
)


@app.exception_handler(InvalidImageError)
async def invalid_image_handler(request: Request, exc: InvalidImageError) -> JSONResponse:
    """画像エラーは、どのエンドポイントでも 400 + 翻訳済みの detail で返す。"""
    lang = resolve_lang(request.headers.get("accept-language"))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": translate(exc.key, lang)},
    )

# 認証なしで叩ける計算・計測だけを制限する。認証済みの操作は巻き込まない。
app.add_middleware(
    RateLimitMiddleware,
    prefixes=("/api/fortune", "/api/species", "/api/analytics"),
    limit=settings.public_rate_limit,
    window_seconds=settings.public_rate_window_seconds,
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
app.include_router(analytics.router, prefix="/api")

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
