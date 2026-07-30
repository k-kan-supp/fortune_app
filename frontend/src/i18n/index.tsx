import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyLang, detectLang, storeLang, type Lang } from "./lang";
import { en } from "./messages/en";
import { ja, type Messages } from "./messages/ja";

export { LANGS, getLang, type Lang } from "./lang";

const CATALOGS: Record<Lang, Messages> = { ja, en };

/** "fortune.form.year" のようなドット区切りキー（ja.ts の構造から生成）。 */
type Path<T> = T extends string
  ? ""
  : {
      [K in keyof T & string]: Path<T[K]> extends "" ? K : `${K}.${Path<T[K]>}`;
    }[keyof T & string];

export type MessageKey = Path<Messages>;

/** {{name}} 形式のプレースホルダに渡す値。 */
type Params = Record<string, string | number>;

export type Translate = (key: MessageKey, params?: Params) => string;

function lookup(catalog: Messages, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], catalog);
  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** 指定言語で翻訳する（未定義キーは日本語 → キー名の順にフォールバック）。 */
export function translate(lang: Lang, key: MessageKey, params?: Params): string {
  const text = lookup(CATALOGS[lang], key) ?? lookup(ja, key) ?? key;
  return interpolate(text, params);
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

/** 言語の保持と切り替えを提供する。localStorage に選択を保存する。 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  // <html lang> とモジュール側の現在値（API ヘッダ用）を同期する
  useEffect(() => {
    applyLang(lang);
    document.title = translate(lang, "app.title");
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    storeLang(next);
    setLangState(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within <I18nProvider>");
  return value;
}
