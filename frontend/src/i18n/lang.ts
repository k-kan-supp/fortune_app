/** 対応言語と、現在の言語の保持（React 外からも参照できるようにする）。 */

export const LANGS = ["ja", "en"] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = "fortune.lang";

function isLang(value: string | null): value is Lang {
  return value !== null && (LANGS as readonly string[]).includes(value);
}

/** 保存済みの選択があればそれを、無ければブラウザの言語設定を使う。 */
export function detectLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isLang(stored)) return stored;
  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
}

export function storeLang(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang);
}

// API クライアント（フック外）からも参照するため、モジュール変数にも持つ。
// 最初の fetch が Provider の副作用より先に走ることがあるので、読み込み時に決める。
let current: Lang = detectLang();

/** 現在の言語。Provider の外（fetch のヘッダ等）から使う。 */
export function getLang(): Lang {
  return current;
}

/** Provider から呼ばれ、モジュール側の現在値と <html lang> を同期する。 */
export function applyLang(lang: Lang): void {
  current = lang;
  document.documentElement.lang = lang;
}
