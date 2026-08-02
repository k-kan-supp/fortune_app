import { useEffect, useMemo, useState } from "react";
import { findMessage, useI18n, type Lang } from "@/i18n";
import { fetchSpeciesCompat } from "../api/fortuneApi";
import { formatValue } from "../radarGeometry";
import { SpeciesIcon } from "../speciesIcons";
import type { SpeciesCompat } from "../types";

/** 段階は 5 つ。色は単一色相の濃淡で、数値はセルを選べば必ず読める。 */
const STEPS = 5;

const speciesName = (code: string, lang: Lang): string =>
  findMessage(lang, `fortune.species.${code}.name`) ?? code;

/**
 * 25 種族どうしの相性マップ。
 *
 * 値はバックエンドが相性エンジンを総当たりして測った平均で、ここは
 * 濃淡に置き換えて並べるだけ。色だけに意味を持たせないよう、選んだ組は
 * 数値と名前で読めるようにし、自分の行は一覧としても出す。
 */
export function SpeciesCompatMap({ mine }: { mine: string }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<SpeciesCompat>();
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<{ a: string; b: string }>({ a: mine, b: mine });

  useEffect(() => {
    fetchSpeciesCompat()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const range = useMemo(() => {
    if (!data) return null;
    const flat = data.matrix.flat();
    return { min: Math.min(...flat), max: Math.max(...flat) };
  }, [data]);

  if (failed) return <p className="error">{t("errors.fetch")}</p>;
  if (!data || !range) return <p className="hint result-status">{t("common.loading")}</p>;

  const at = (a: string, b: string) => data.matrix[data.codes.indexOf(a)][data.codes.indexOf(b)];
  /** 値を 0〜STEPS-1 の濃さに割り当てる（実測の最小〜最大を等分）。 */
  const level = (v: number) =>
    Math.min(STEPS - 1, Math.floor(((v - range.min) / (range.max - range.min || 1)) * STEPS));

  const pickedScore = at(picked.a, picked.b);

  // 自分から見た相性順。マップを読まなくても順位が分かるようにしておく
  const ranked = data.codes
    .map((code) => ({ code, score: at(mine, code) }))
    .sort((x, y) => y.score - x.score);

  return (
    <section className="compat-map-section">
      <div className="result-head">
        <h2>{t("fortune.compatMap.title")}</h2>
        <p className="hint">{t("fortune.compatMap.hint")}</p>
      </div>

      <div className="compat-map-scroll">
        <table className="compat-map">
          <caption className="sr-only">{t("fortune.compatMap.title")}</caption>
          <thead>
            <tr>
              <th />
              {data.codes.map((code) => (
                <th key={code} scope="col" className={code === mine ? "is-mine" : undefined}>
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.codes.map((rowCode) => (
              <tr key={rowCode}>
                <th scope="row" className={rowCode === mine ? "is-mine" : undefined}>
                  {rowCode}
                </th>
                {data.codes.map((colCode) => {
                  const value = at(rowCode, colCode);
                  const isPicked = picked.a === rowCode && picked.b === colCode;
                  const onAxis = rowCode === mine || colCode === mine;
                  return (
                    <td key={colCode}>
                      <button
                        type="button"
                        className={`compat-cell l${level(value)}${isPicked ? " is-picked" : ""}${
                          onAxis ? " is-mine-axis" : ""
                        }`}
                        title={`${speciesName(rowCode, lang)} × ${speciesName(colCode, lang)} — ${formatValue(value)}`}
                        onClick={() => setPicked({ a: rowCode, b: colCode })}
                      >
                        <span className="sr-only">{formatValue(value)}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="compat-legend">
        <span>{t("fortune.compatMap.low", { value: formatValue(range.min) })}</span>
        <span className="compat-ramp" aria-hidden="true">
          {Array.from({ length: STEPS }, (_, i) => (
            <i key={i} className={`l${i}`} />
          ))}
        </span>
        <span>{t("fortune.compatMap.high", { value: formatValue(range.max) })}</span>
      </div>

      <div className="compat-readout">
        <div className="compat-pair">
          <span className="compat-side">
            <span className="compat-art">
              <SpeciesIcon code={picked.a} />
            </span>
            <b>{speciesName(picked.a, lang)}</b>
            <em>{picked.a}</em>
          </span>
          <span className="compat-value">{formatValue(pickedScore)}</span>
          <span className="compat-side">
            <span className="compat-art">
              <SpeciesIcon code={picked.b} />
            </span>
            <b>{speciesName(picked.b, lang)}</b>
            <em>{picked.b}</em>
          </span>
        </div>
        <p className="hint">{t("fortune.compatMap.note")}</p>
      </div>

      <details className="compat-ranking">
        <summary>{t("fortune.compatMap.ranking", { name: speciesName(mine, lang) })}</summary>
        <ol>
          {ranked.map((entry) => (
            <li key={entry.code} className={entry.code === mine ? "is-mine" : undefined}>
              <span>{speciesName(entry.code, lang)}</span>
              <em>{entry.code}</em>
              <b>{formatValue(entry.score)}</b>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
