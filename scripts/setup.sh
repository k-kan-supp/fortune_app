#!/usr/bin/env bash
# 開発環境を一度だけ整える。venv / node_modules はリポジトリ配下の固定パスに置く。
#
# セッション毎の一時ディレクトリに venv を作ると、パスが毎回変わって
# 権限の許可リストが効かなくなる（＝ループが止まる）。必ずここを使う。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PYTHON="${PYTHON:-}"
if [[ -z "$PYTHON" ]]; then
  for c in python3.12 python3.11 python3; do
    if command -v "$c" >/dev/null 2>&1; then PYTHON="$(command -v "$c")"; break; fi
  done
fi
[[ -n "$PYTHON" ]] || { echo "python3.11+ が見つかりません" >&2; exit 1; }

echo "▶ backend: .venv ($PYTHON)"
[[ -d "$ROOT/backend/.venv" ]] || "$PYTHON" -m venv "$ROOT/backend/.venv"
"$ROOT/backend/.venv/bin/pip" install -q --upgrade pip
(cd "$ROOT/backend" && ./.venv/bin/pip install -q -e ".[dev]")

echo "▶ frontend: node_modules"
(cd "$ROOT/frontend" && npm install --no-audit --no-fund)

echo
echo "完了。検証は ./scripts/check.sh"
