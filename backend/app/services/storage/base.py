from typing import Protocol


class FileStorage(Protocol):
    """ファイル保存の抽象インターフェース。

    ローカル / S3 / GCS などを差し替えられるよう Protocol にしている。
    ``key`` はストレージ内での識別子（例: "avatars/xxx.webp"）。
    """

    async def save(self, key: str, content: bytes) -> None: ...

    async def delete(self, key: str) -> None: ...

    def url(self, key: str) -> str:
        """公開URL（またはパス）を返す。"""
        ...
