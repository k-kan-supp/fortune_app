class ConsoleEmailSender:
    """開発用: メールを実送信せず、内容を標準出力へ出す。

    登録用URLはここに出力されるので、開発中はサーバのログを見てアクセスする。
    uvicorn/Docker のログに確実に出るよう、logging ではなく print(flush) を使う。
    """

    async def send(self, *, to: str, subject: str, body: str) -> None:
        print(
            f"\n===== [DEV EMAIL] =====\nTo: {to}\nSubject: {subject}\n\n{body}\n"
            "=======================",
            flush=True,
        )
