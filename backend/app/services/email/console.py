import logging

logger = logging.getLogger("email")


class ConsoleEmailSender:
    """開発用: メールを実送信せず、内容をログ(標準出力)へ出す。

    登録用URLはここに出力されるので、開発中はサーバのログを見てアクセスする。
    """

    async def send(self, *, to: str, subject: str, body: str) -> None:
        logger.info(
            "\n===== [DEV EMAIL] =====\nTo: %s\nSubject: %s\n\n%s\n=======================",
            to,
            subject,
            body,
        )
