import { useEffect, useMemo, useState } from "react";
import { findMessage, useI18n, type Lang, type MessageKey } from "@/i18n";
import { fetchSpeciesCompat } from "../api/fortuneApi";
import { formatValue } from "../radarGeometry";
import { SpeciesIcon } from "../speciesIcons";
import { axisLabel } from "../terms";
import type { SpeciesCompat } from "../types";
import { RadarChart } from "./RadarChart";

/**
 * 平均を境に、上は暖色・下は寒色へ 3 段ずつ。中央は無彩色。
 * 検証済み（暗い面に対して各段 2:1 以上、隣接の明度差 0.06 以上、
 * 各アームは単一色相 — 寒色 4°/暖色 20°）。
 */
const STEPS_PER_SIDE = 3;

/** 相性は 0〜100。外周を 100 に固定し、軸を途中から始めない。 */
const MAX_SCORE = 100;

const speciesName = (code: string, lang: Lang): string =>
  findMessage(lang, `fortune.species.${code}.name`) ?? code;

/** 種族コードの1文字目＝五行、2文字目＝主星グループ。表示名は既存の訳語辞書で引く。 */
const elementOf = (code: string, lang: Lang, ns: string): string =>
  axisLabel(ELEMENT_BY_LETTER[code[0]] ?? code[0], lang, ns);
const groupOf = (code: string, lang: Lang): string =>
  axisLabel(GROUP_BY_LETTER[code[1]] ?? code[1], lang, "tenGodGroup");

const ELEMENT_BY_LETTER: Record<string, string> = {
  W: "木",
  F: "火",
  E: "土",
  M: "金",
  A: "水",
};
const GROUP_BY_LETTER: Record<string, string> = {
  S: "比劫",
  X: "食傷",
  G: "財星",
  O: "官殺",
  L: "印星",
};

/**
 * 25 種族との相性。
 *
 * 主役は本人から見たレーダーで、25 軸の大小を一目で掴めるようにする。
 * 軸は五行の族ごとに並ぶので、どの族と噛み合うかが形として出る。
 * 全体の 25×25 は、その下に濃淡のマップとして添える。
 *
 * 値はバックエンドが相性エンジンを総当たりして測った平均で、ここは表示だけ。
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

  // 本人の行。レーダーの軸はコードだけを出す（25 軸に名前は入らない）
  const myRow = useMemo(() => {
    if (!data) return [];
    const i = data.codes.indexOf(mine);
    return data.codes.map((code, j) => ({ code, label: code, value: data.matrix[i][j] }));
  }, [data, mine]);

  if (failed) return <p className="error">{t("errors.fetch")}</p>;
  if (!data || !range) return <p className="hint result-status">{t("common.loading")}</p>;

  const at = (a: string, b: string) => data.matrix[data.codes.indexOf(a)][data.codes.indexOf(b)];

  /** 平均からの隔たりを -3〜+3 に割り当てる。正なら暖色、負なら寒色。 */
  const tier = (v: number) => {
    const side = v > data.mean ? range.max - data.mean : data.mean - range.min;
    if (v === data.mean || side <= 0) return 0;
    const step = Math.min(STEPS_PER_SIDE, Math.ceil((Math.abs(v - data.mean) / side) * STEPS_PER_SIDE));
    return v > data.mean ? step : -step;
  };
  const toneOf = (v: number) => (v > data.mean ? "warm" : v < data.mean ? "cool" : "even");

  const myName = speciesName(mine, lang);
  const pickedScore = at(picked.a, picked.b);

  // 選んだ組のサマリー。五行の関係はバックエンドの判定を引くだけで、ここでは決めない。
  const summary = [
    t(
      `fortune.compatMap.summary.element.${
        data.element_relations[picked.a[0] + picked.b[0]] ?? "same"
      }` as MessageKey,
      { a: elementOf(picked.a, lang, "element"), b: elementOf(picked.b, lang, "element") },
    ),
    picked.a[1] === picked.b[1]
      ? t("fortune.compatMap.summary.group.same", { a: groupOf(picked.a, lang) })
      : t("fortune.compatMap.summary.group.different", {
          a: groupOf(picked.a, lang),
          b: groupOf(picked.b, lang),
        }),
    t(
      `fortune.compatMap.summary.band.${
        pickedScore >= data.band_high ? "high" : pickedScore <= data.band_low ? "low" : "mid"
      }` as MessageKey,
      { value: formatValue(pickedScore), mean: formatValue(data.mean) },
    ),
  ].join(findMessage(lang, "fortune.narrative.sentenceJoin") ?? "");

  // 自分から見た相性順。レーダーの形を数値でも追えるようにしておく
  const ranked = data.codes
    .map((code) => ({ code, score: at(mine, code) }))
    .sort((x, y) => y.score - x.score);
  const best = ranked[0];

  return (
    <section className="compat-map-section">
      <div className="result-head">
        <h2>{t("fortune.compatMap.title")}</h2>
        <p className="hint">{t("fortune.compatMap.hint", { name: myName })}</p>
        <p className="hint">{t("fortune.compatMap.caveat")}</p>
      </div>

      <RadarChart
        points={myRow.map((p) => ({ ...p, tone: toneOf(p.value) }))}
        maxValue={MAX_SCORE}
        title={t("fortune.compatMap.radarTitle", { name: myName })}
        onSelectAxis={(i) => setPicked({ a: mine, b: myRow[i].code })}
      />
      <p className="hint compat-axis-note">{t("fortune.compatMap.axisGroups")}</p>

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
            <em>{picked.b === mine && picked.a === mine ? t("fortune.compatMap.self") : picked.b}</em>
          </span>
        </div>
        <p className="compat-summary">{summary}</p>
      </div>

      <details className="compat-ranking">
        <summary>{t("fortune.compatMap.ranking", { name: myName })}</summary>
        <ol>
          {ranked.map((entry) => (
            <li
              key={entry.code}
              className={`tone-${toneOf(entry.score)}${entry.code === mine ? " is-mine" : ""}${
                entry.code === best.code ? " is-best" : ""
              }`}
            >
              <span>{speciesName(entry.code, lang)}</span>
              <em>{entry.code}</em>
              <b>{formatValue(entry.score)}</b>
            </li>
          ))}
        </ol>
      </details>

      <h3 className="compat-map-title">{t("fortune.compatMap.mapTitle")}</h3>
      <p className="hint">{t("fortune.compatMap.mapHint")}</p>

      <div className="compat-map-scroll">
        <table className="compat-map">
          <caption className="sr-only">{t("fortune.compatMap.mapTitle")}</caption>
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
                        className={`compat-cell t${tier(value)}${isPicked ? " is-picked" : ""}${
                          onAxis ? " is-mine-axis" : ""
                        }${rowCode === mine && colCode === best.code ? " is-best" : ""}`}
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
          {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
            <i key={n} className={`t${n}`} />
          ))}
        </span>
        <span>{t("fortune.compatMap.high", { value: formatValue(range.max) })}</span>
        <span className="compat-legend-mean">
          {t("fortune.compatMap.meanLabel", { value: formatValue(data.mean) })}
        </span>
      </div>
    </section>
  );
}
