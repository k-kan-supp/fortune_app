from app.core.config import settings
from app.services.email.base import EmailSender
from app.services.email.console import ConsoleEmailSender


def get_email_sender() -> EmailSender:
    """設定に応じたメール送信バックエンドを返す。

    本番プロバイダ (SMTP / Resend 等) を足すときは、ここに分岐を追加するだけで
    呼び出し側は一切変更不要になる。
    """
    # if settings.email_backend == "smtp":
    #     return SmtpEmailSender(...)
    return ConsoleEmailSender()
