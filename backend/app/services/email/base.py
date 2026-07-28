from typing import Protocol


class EmailSender(Protocol):
    """メール送信の抽象インターフェース。

    実装 (Console / SMTP / API プロバイダ) を差し替えられるよう Protocol にしている。
    """

    async def send(self, *, to: str, subject: str, body: str) -> None: ...
