import { useEffect, useState } from "react";
import { useI18n, type MessageKey } from "@/i18n";
import { fetchDailyFortune } from "../api/fortuneApi";
import { formatValue } from "../radarGeometry";
import { axisLabel } from "../terms";
import type { DailyFortune as DailyFortuneData, FortuneRequest } from "../types";

/** "2026-08-02T04:50" から時刻だけを取り出す。 */
const clockOf = (iso: string): string => iso.slice(11, 16);

/**
 * その日の運勢。
 *
 * 気象を五行に置き換えて命式と重ねる判定はバックエンドが済ませていて、
 * ここは観測値と結果を並べるだけ。気象が取れない日は節ごと出さない。
 */
export function DailyFortune({ request }: { request: FortuneRequest }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<DailyFortuneData>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    fetchDailyFortune(request)
      .then(setData)
      .catch(() => setFailed(true));
  }, [request]);

  if (failed) return <p className="hint daily-unavailable">{t("fortune.daily.unavailable")}</p>;
  if (!data) return null;

  const { reading } = data;
  const top = data.elements.reduce((best, e) => (e.value > best.value ? e : best), data.elements[0]);
  const join = t("common.metaSeparator");
  const names = (codes: string[]) => codes.map((c) => axisLabel(c, lang, "element")).join(join);

  const facts: { key: MessageKey; value: string }[] = [
    { key: "fortune.daily.reading.temperature", value: `${formatValue(reading.temperature_c)}℃` },
    { key: "fortune.daily.reading.humidity", value: `${formatValue(reading.humidity_pct)}%` },
    { key: "fortune.daily.reading.sky", value: t(`fortune.daily.sky.${data.sky}` as MessageKey) },
    { key: "fortune.daily.reading.sunrise", value: clockOf(reading.sunrise) },
    { key: "fortune.daily.reading.sunset", value: clockOf(reading.sunset) },
    {
      key: "fortune.daily.reading.daylight",
      value: t("fortune.daily.reading.hours", { value: formatValue(reading.daylight_hours) }),
    },
  ];

  const note = [
    t("fortune.daily.note.lead", {
      element: axisLabel(top.code, lang, "element"),
      pct: formatValue(top.value),
    }),
    data.fills.length
      ? t("fortune.daily.note.fills", { list: names(data.fills) })
      : t("fortune.daily.note.fillsNone"),
    data.floods.length
      ? t("fortune.daily.note.floods", { list: names(data.floods) })
      : t("fortune.daily.note.floodsNone"),
    t(`fortune.daily.band.${data.band}` as MessageKey),
  ].join(t("fortune.narrative.sentenceJoin"));

  return (
    <section className="daily-card">
      <div className="daily-head">
        <div>
          <p className="daily-eyebrow">{t("fortune.daily.title")}</p>
          <p className="daily-date">{reading.date}</p>
        </div>
        <p className={`daily-score is-${data.band}`}>
          <b>{formatValue(data.score)}</b>
          <span>{t("fortune.daily.unit")}</span>
        </p>
      </div>

      <dl className="daily-facts">
        {facts.map((fact) => (
          <div key={fact.key}>
            <dt>{t(fact.key)}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <p className="daily-air-title">{t("fortune.daily.airTitle")}</p>
      <ul className="daily-air">
        {data.elements.map((element) => (
          <li key={element.code}>
            <i>{axisLabel(element.code, lang, "element")}</i>
            <span className="daily-bar">
              <b style={{ width: `${element.value}%` }} />
            </span>
            <u>{formatValue(element.value)}%</u>
          </li>
        ))}
      </ul>

      <p className="daily-note">{note}</p>
      <p className="hint daily-scale">{t("fortune.daily.scale")}</p>
    </section>
  );
}
