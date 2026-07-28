from pathlib import Path

from app.core.config import settings


class LocalFileStorage:
    """開発用: ローカルディレクトリにファイルを保存する。

    保存先は ``UPLOAD_DIR``。FastAPI の StaticFiles で
    ``UPLOAD_URL_PREFIX`` にマウントして配信する。
    """

    def __init__(self) -> None:
        self.root = Path(settings.upload_dir)

    def _path(self, key: str) -> Path:
        return self.root / key

    async def save(self, key: str, content: bytes) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    async def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)

    def url(self, key: str) -> str:
        return f"{settings.upload_url_prefix}/{key}"
