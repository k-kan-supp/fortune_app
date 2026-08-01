import { useEffect, useState } from "react";
import { findMessage, useI18n } from "@/i18n";
import { getMatchCompatibility } from "../api/matchingApi";
import type { Compatibility } from "../types";

interface Props {
  matchId: string;
  /** 選んだ一言を入力欄へ入れる。 */
  onPick: (text: string) => void;
}

/**
 * まだ一言も交わしていないマッチに出す「きっかけ」パネル。
 *
 * マッチ直後に何を書けばいいか分からず放置されるのが、チャットが始まらない
 * 一番の理由なので、相性の判断根拠をそのまま話題として差し出す。
 * 生年月日が未登録などで相性を出せないときは、黙って何も出さない。
 */
export function ChatOpeners({ matchId, onPick }: Props) {
  const [compat, setCompat] = useState<Compatibility | null>(null);
  const { t, lang } = useI18n();

  useEffect(() => {
    let active = true;
    getMatchCompatibility(matchId)
      .then((r) => active && setCompat(r))
      .catch(() => {
        /* 相性を出せない相手では、このパネル自体を出さない */
      });
    return () => {
      active = false;
    };
  }, [matchId]);

  if (!compat || compat.facets.length === 0) return null;

  // 一番高い面を話題にする。低い面から入ると、初手が言い訳がましくなる。
  const top = [...compat.facets].sort((a, b) => b.value - a.value)[0];
  const facetLabel = findMessage(lang, `compat.facets.${top.code}`) ?? top.code;
  const reason = findMessage(lang, `compat.facetNotes.${top.code}`);
  const openers = [
    findMessage(lang, `chat.openers.${top.code}`),
    t("chat.openers.generic"),
  ].filter((s): s is string => Boolean(s));

  return (
    <section className="chat-openers">
      <p className="chat-openers-eyebrow">{t("chat.openersTitle")}</p>
      <p className="chat-openers-reason">
        {t("chat.openersLead", {
          facet: facetLabel,
          score: Math.round(top.value),
        })}
        {reason ? `（${reason}）` : ""}
      </p>
      <ul className="chat-openers-list">
        {openers.map((text) => (
          <li key={text}>
            <button type="button" className="chat-opener" onClick={() => onPick(text)}>
              {text}
            </button>
          </li>
        ))}
      </ul>
      <p className="chat-openers-hint">{t("chat.openersHint")}</p>
    </section>
  );
}
