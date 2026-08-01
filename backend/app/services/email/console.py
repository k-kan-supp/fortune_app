import logging

logger = logging.getLogger("app.email")


class ConsoleEmailSender:
    """開発用: メールを実送信せず、内容を標準出力へ出す。

    登録用URLはここに出力されるので、開発中はサーバのログを見てアクセスする。
    本文には生のマジックリンクが載る。**開発専用**であり、本番では
    ``EMAIL_BACKEND`` を実送信の実装に差し替えること。
    """

    async def send(self, *, to: str, subject: str, body: str) -> None:
        # 本文ごと出すのが目的なので整形済みの1メッセージとして流す。
        # 宛先を伏せないのも、開発中にどのアドレスで登録したか追うため。
        logger.warning(
            "[DEV EMAIL] not actually sent\nTo: %s\nSubject: %s\n\n%s",
            to,
            subject,
            body,
        )
