"""アップロード画像の検証と変換（アイコン・チャット画像で共用）。

保存形式は WebP に統一する。画像として読めないものはここで弾き、
API 層が言語に応じて訳せるようメッセージキーを持った例外を送出する。
"""

import io
import logging

from PIL import Image, UnidentifiedImageError

logger = logging.getLogger("app.images")

# 受け付けるアップロードの Content-Type
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


class InvalidImageError(Exception):
    """アップロードされた画像が不正・非対応の場合。

    ``key`` は app.core.i18n のメッセージキー。API 層で言語に応じて訳す。
    """

    def __init__(self, key: str) -> None:
        super().__init__(key)
        self.key = key


def _open_rgb(raw: bytes) -> Image.Image:
    """バイト列を検証しつつ RGB の画像として開く。"""
    try:
        Image.open(io.BytesIO(raw)).verify()  # まず破損チェック
        img = Image.open(io.BytesIO(raw))  # verify 後は再オープンが必要
    except (UnidentifiedImageError, OSError) as e:
        logger.info(
            "rejected an unreadable image",
            extra={"bytes": len(raw), "reason": type(e).__name__},
        )
        raise InvalidImageError("image.unreadable") from e
    return img.convert("RGB")


def _to_webp(img: Image.Image, quality: int) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality)
    return buf.getvalue()


def to_square_webp(raw: bytes, size: int, quality: int = 85) -> bytes:
    """中央を正方形に切り出し、``size`` 四方に揃えた WebP を返す。"""
    img = _open_rgb(raw)

    side = min(img.size)
    left = (img.width - side) // 2
    top = (img.height - side) // 2
    img = img.crop((left, top, left + side, top + side))

    return _to_webp(img.resize((size, size)), quality)


def to_bounded_webp(raw: bytes, max_px: int, quality: int = 82) -> bytes:
    """縦横比を保ったまま長辺を ``max_px`` 以下に縮めた WebP を返す。"""
    img = _open_rgb(raw)
    img.thumbnail((max_px, max_px))
    return _to_webp(img, quality)
