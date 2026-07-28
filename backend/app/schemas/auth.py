from pydantic import BaseModel, EmailStr


class MagicLinkRequest(BaseModel):
    """登録/ログイン用のマジックリンク送信リクエスト。"""

    email: EmailStr


class MagicLinkVerifyRequest(BaseModel):
    """メールURL内のトークンを検証するリクエスト。"""

    token: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    is_verified: bool


class AuthResult(BaseModel):
    """検証成功時のログインセッション情報。"""

    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    message: str
