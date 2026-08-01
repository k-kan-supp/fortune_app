import logging
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger("app.storage")


class LocalFileStorage:
    """開発用: ローカルディレクトリにファイルを保存する。

    保存先は ``UPLOAD_DIR``。FastAPI の StaticFiles で
    ``UPLOAD_URL_PREFIX`` にマウントして配信する。
    """

    def __init__(self) -> None:
        self.root = Path(settings.upload_dir)

    def _path(self, key: str) -> Path:
        return self.root / key

    # key は uuid ベースで個人情報を含まないため、そのまま残してよい。
    # 「画像が出ない」の調査では保存と削除の対応を追えることが要るので debug で両方出す。
    async def save(self, key: str, content: bytes) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        logger.debug("file saved", extra={"key": key, "bytes": len(content)})

    async def delete(self, key: str) -> None:
        path = self._path(key)
        existed = path.exists()
        path.unlink(missing_ok=True)
        # 消そうとして無い＝二重削除か取りこぼし。後から効いてくるので記録する。
        logger.debug("file deleted", extra={"key": key, "existed": existed})

    def url(self, key: str) -> str:
        return f"{settings.upload_url_prefix}/{key}"
