#!/usr/bin/env bash
# 単一の検証ゲート。ループの各イテレーションはこれ 1 本で赤/緑を判定する。
#
#   ./scripts/check.sh            全部（ruff / mypy / pytest / tsc / eslint）
#   ./scripts/check.sh fast       テストと型だけ（pytest + tsc）— 反復中の既定
#   ./scripts/check.sh backend    backend のみ
#   ./scripts/check.sh frontend   frontend のみ
#
# 最初の失敗で止めず全ステップを走らせる。ループは 1 回の実行で全体像を得たいため。
# 終了コード: 0 = 全通過 / 1 = いずれか失敗。

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACK="$ROOT/backend"
FRONT="$ROOT/frontend"
PY="$BACK/.venv/bin"
NM="$FRONT/node_modules/.bin"

MODE="${1:-all}"
FAILED=()
PASSED=()

run() {
  local name="$1" dir="$2"
  shift 2
  printf '\n\033[1m▶ %s\033[0m\n' "$name"
  if (cd "$dir" && "$@"); then
    PASSED+=("$name")
  else
    FAILED+=("$name")
    printf '\033[31m✗ %s failed\033[0m\n' "$name"
  fi
}

need() {
  if [[ ! -x "$1" ]]; then
    printf '\033[31m環境が未整備です: %s が見つかりません\033[0m\n' "$1" >&2
    printf 'セットアップ: ./scripts/setup.sh\n' >&2
    exit 2
  fi
}

do_backend() {
  need "$PY/python"
  if [[ "$MODE" != "fast" ]]; then
    run "backend: ruff"  "$BACK" "$PY/ruff" check .
    run "backend: mypy"  "$BACK" "$PY/mypy" app
  fi
  run "backend: pytest" "$BACK" "$PY/python" -m pytest -q
}

do_frontend() {
  need "$NM/tsc"
  run "frontend: tsc" "$FRONT" "$NM/tsc" -b --pretty false
  if [[ "$MODE" != "fast" ]]; then
    run "frontend: eslint" "$FRONT" "$NM/eslint" . --max-warnings 0
  fi
}

case "$MODE" in
  backend)          do_backend ;;
  frontend)         do_frontend ;;
  all|fast)         do_backend; do_frontend ;;
  *) echo "usage: $0 [all|fast|backend|frontend]" >&2; exit 2 ;;
esac

printf '\n\033[1m── 結果 (%s) ──\033[0m\n' "$MODE"
for n in "${PASSED[@]:-}"; do [[ -n "$n" ]] && printf '\033[32m  ✓ %s\033[0m\n' "$n"; done
for n in "${FAILED[@]:-}"; do [[ -n "$n" ]] && printf '\033[31m  ✗ %s\033[0m\n' "$n"; done

if [[ ${#FAILED[@]} -gt 0 ]]; then
  printf '\n\033[31mFAIL: %d 件\033[0m\n' "${#FAILED[@]}"
  exit 1
fi
printf '\n\033[32mPASS: 全 %d ステップ通過\033[0m\n' "${#PASSED[@]}"
