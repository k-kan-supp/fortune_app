# 四柱推命アプリ (Four Pillars of Destiny)

日本語 | [English](README.en.md)

生年月日時から四柱推命の命式を算出・鑑定する Web アプリケーション。
画面表示は日本語 / 英語に対応しています（右上の言語切り替え、初期値はブラウザの言語設定）。

## 構成

| レイヤー   | 技術                          | ディレクトリ |
| ---------- | ----------------------------- | ------------ |
| フロント   | React + Vite + TypeScript     | `frontend/`  |
| バックエンド | Python + FastAPI            | `backend/`   |

四柱推命の計算ロジック（干支・十神・蔵干など）は backend の `app/services/saju/` に集約し、
フロントは入力と結果表示に専念する構成です。

## セットアップ

### バックエンド

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env

# PostgreSQL を起動（Docker）
docker compose up -d db

# DB マイグレーション適用
alembic upgrade head

# サーバ起動
uvicorn app.main:app --reload
# → http://localhost:8000/docs でAPIドキュメント
```

#### ユーザー登録の動作確認（開発時）

メールは実送信せず**サーバのログに登録用URLが出力されます**（`EMAIL_BACKEND=console`）。

1. `/register` でメールアドレスを送信
2. `uvicorn` を起動しているターミナルのログに出る `.../auth/verify?token=...` を開く
3. トークンが検証され、ログイン（JWT を localStorage に保存）完了

本番でメールを実送信する場合は `app/services/email/` に SMTP / Resend 等の実装を追加し、
`get_email_sender()` に分岐を足すだけで差し替えられます。

### フロントエンド

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

## ディレクトリ構成

詳細は [docs/architecture.md](docs/architecture.md) を参照。
