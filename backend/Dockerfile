FROM python:3.12-slim

# sxtwl 等が wheel 提供されない場合のビルドに備える
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 依存解決のため先にプロジェクト定義とコードをコピーして install
COPY . .
RUN pip install --no-cache-dir .

EXPOSE 8000

# 起動時に DB マイグレーションを適用してからサーバ起動
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
