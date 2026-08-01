/**
 * API 呼び出しの失敗を画面に出す文言に変換する。
 * fetch ラッパ (api/client.ts) はサーバの detail を Error に載せて投げるので、
 * それが取れればそのまま見せ、取れないときだけ用意した文言を出す。
 */
export const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;
