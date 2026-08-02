from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """環境変数から読み込むアプリ設定。"""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173"

    # ログ
    log_level: str = "INFO"
    # 本番は収集基盤に載せる前提で JSON。開発は読みやすさ優先でテキスト。
    log_json: bool = False

    # DB
    database_url: str = "postgresql+asyncpg://fortune:fortune@localhost:5432/fortune"

    # 認証
    secret_key: str = "change-me"
    magic_link_expire_minutes: int = 15
    access_token_expire_minutes: int = 60 * 24 * 7

    # 認証不要の計算エンドポイントの上限（1IPあたり / 窓）。
    # 検索から来た人がその場で条件を変えて何度か試せる余裕を残す。
    public_rate_limit: int = 60
    public_rate_window_seconds: float = 60.0

    # 課金。決済がまだ無い間は開けておく（有料の解説文を誰も買えないため）。
    # 決済が入ったらここを true にし、判定を entitlement に移す。
    paywall_enabled: bool = False

    # メール
    email_backend: str = "console"
    email_from: str = "no-reply@fortune.local"

    # ファイルストレージ（アイコン等）
    storage_backend: str = "local"
    upload_dir: str = "uploads"          # ローカル保存先ディレクトリ
    upload_url_prefix: str = "/uploads"  # 公開URLのプレフィックス
    avatar_max_bytes: int = 5 * 1024 * 1024  # 5MB
    avatar_size_px: int = 512            # 正方形にリサイズする一辺

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
