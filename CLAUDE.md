# CLAUDE.md

四柱推命アプリ。`frontend/` = React + Vite + TypeScript、`backend/` = FastAPI。
構成の詳細は [docs/architecture.md](docs/architecture.md)、占術用語は [docs/saju-glossary.md](docs/saju-glossary.md)。

## 検証ゲート（最重要）

変更後は必ずこれを通す。全ステップ約 5 秒で、これ 1 本が赤/緑の唯一の判定基準。

```bash
./scripts/check.sh          # ruff / mypy / pytest / tsc / eslint
./scripts/check.sh fast     # pytest + tsc のみ（反復中）
./scripts/check.sh backend  # backend だけ
./scripts/check.sh frontend # frontend だけ
```

終了コード 0 = 全通過、1 = いずれか失敗。最初の失敗で止まらず全ステップ走るので、
1 回の実行で全体像が出る。**main は常にこれが緑の状態を維持する。**

環境が壊れたら `./scripts/setup.sh`（venv と node_modules を作り直す）。

## 環境の固定パス

依存はリポジトリ配下の固定パスに置く。**セッション毎の一時ディレクトリに venv を作らない** —
パスが毎回変わって権限の許可リストが効かなくなり、無人ループが権限待ちで止まる。

| 用途 | パス |
| --- | --- |
| Python | `backend/.venv/bin/python`（3.12、`pip install -e ".[dev]"` 済み） |
| Node | `frontend/node_modules/.bin/` |

一時ファイル・実験スクリプト・スクリーンショットはリポジトリではなく scratchpad に置く。
`frontend/src/__*.tsx` は使い捨てのスクショ用ハーネス用の命名で、eslint 対象外。

## 個別に叩く場合

```bash
cd backend  && ./.venv/bin/python -m pytest -q            # テスト
cd backend  && ./.venv/bin/ruff check . --fix             # 自動修正
cd backend  && ./.venv/bin/mypy app                       # strict モード
cd frontend && ./node_modules/.bin/tsc -b --pretty false
cd frontend && ./node_modules/.bin/eslint . --max-warnings 0
```

開発サーバ:

```bash
cd backend  && ./.venv/bin/uvicorn app.main:app --reload   # :8000（/docs で API ドキュメント）
cd frontend && npm run dev                                 # :5173
docker compose up --build                                  # 全スタック → :8090
```

DB を使う機能（auth / profile / matching）は PostgreSQL が要る:
`docker compose up -d db` → `cd backend && ./.venv/bin/alembic upgrade head`。
四柱推命の計算と `tests/services/` は DB 不要で単体で回せる。

## 守るべき点

- 占術ロジックは `backend/app/services/saju/` に集約する。フロントは入力と表示だけ。
  スコアや判定をフロント側で再計算しない。
- 表示文言は日英両対応。`frontend/src/i18n/messages/{ja,en}.ts` は必ず同じキー構造で
  同時に更新する。サーバ発の文言は `backend/app/core/i18n.py` の `MESSAGES`。
- mypy は strict。型スタブの無い依存は `pyproject.toml` の `[[tool.mypy.overrides]]` に追加する
  （個別の `# type: ignore` を撒かない）。
- DB スキーマを変えたら `alembic revision` でマイグレーションも足す。
- 相性判定のようなスコアリングを変えたら `backend/tests/services/test_compatibility.py` の
  期待値も追従させる。振る舞いを変えたのにテストが緑なら、テストが足りていない。
