import { useEffect, useState } from "react";
import { useI18n, type Lang, type MessageKey } from "@/i18n";
import { fetchDailyFortune } from "../api/fortuneApi";
import { formatValue } from "../radarGeometry";
import { axisLabel, speciesName } from "../terms";
import type {
  DailyFortune as DailyFortuneData,
  DailyPoint,
  FortuneRequest,
} from "../types";

/** "2026-08-02T04:50" から時刻だけを取り出す。 */
const clockOf = (iso: string): string => iso.slice(11, 16);

const MAX_STARS = 5;

/** 良し悪しの理由になっている要素の名前。五行と通変星グループで引き先が違う。 */
const driverName = (point: DailyPoint, lang: Lang): string =>
  axisLabel(point.driver, lang, point.driver_kind === "element" ? "element" : "tenGodGroup");

function Stars({ n }: { n: number }) {
  return (
    <span className="daily-stars" role="img" aria-label={String(n)}>
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <i key={i} className={i < n ? "on" : undefined} aria-hidden="true">
          ★
        </i>
      ))}
    </span>
  );
}

/**
 * その日の運勢。
 *
 * 気象を五行に置き換え、日主から見た通変星に読み替えて分野ごとの星を出す判定は
 * バックエンドが済ませていて、ここは観測値と結果を並べるだけ。
 * 同じ天気でも種族によって出方が変わるので、種族名を添える。
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
  const name = speciesName(data.species, lang);
  const top = data.elements.reduce((best, e) => (e.value > best.value ? e : best), data.elements[0]);

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

  const sentence = (point: DailyPoint, side: "good" | "bad") =>
    t(`fortune.daily.${side}.${point.driver_kind === "element" ? "element" : "group"}` as MessageKey, {
      area: axisLabel(point.area, lang, "lifeArea"),
      driver: driverName(point, lang),
      name,
    });

  return (
    <section className="daily-card">
      <div className="daily-head">
        <div>
          <p className="daily-eyebrow">{t("fortune.daily.title")}</p>
          <p className="daily-date">{reading.date}</p>
        </div>
        <p className="daily-species">{t("fortune.daily.forSpecies", { name })}</p>
      </div>

      <dl className="daily-facts">
        {facts.map((fact) => (
          <div key={fact.key}>
            <dt>{t(fact.key)}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="daily-areas">
        {data.areas.map((area) => (
          <li key={area.code}>
            <span className="daily-area-name">{axisLabel(area.code, lang, "lifeArea")}</span>
            <Stars n={area.stars} />
            <span className="sr-only">{t("fortune.daily.starsLabel", { n: area.stars })}</span>
          </li>
        ))}
      </ul>

      <div className="daily-points">
        <div className="daily-point daily-point--good">
          <h3>{t("fortune.daily.goodTitle")}</h3>
          <p>{sentence(data.good, "good")}</p>
        </div>
        <div className="daily-point daily-point--bad">
          <h3>{t("fortune.daily.badTitle")}</h3>
          <p>{sentence(data.bad, "bad")}</p>
        </div>
      </div>

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
      <p className="hint daily-scale">
        {t("fortune.daily.airNote", {
          element: axisLabel(top.code, lang, "element"),
          pct: formatValue(top.value),
        })}
        {t("fortune.daily.scale")}
      </p>
    </section>
  );
}
