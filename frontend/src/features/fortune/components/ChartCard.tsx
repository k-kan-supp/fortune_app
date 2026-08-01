import { memo, useMemo } from "react";
import { findMessage, useI18n, type Lang } from "@/i18n";
import { chartTermNs, glossaryText, type TermRef } from "../glossary";
import { formatValue } from "../radarGeometry";
import { axisLabel } from "../terms";
import type { NarrativeSegment, RadarChart as RadarChartData } from "../types";
import { RadarChart } from "./RadarChart";

interface Props {
  chart: RadarChartData;
  /** 軸がクリックされたときに用語解説を開く。 */
  onSelectTerm: (term: TermRef) => void;
}

/**
 * 突出した軸を「名前 ＋ その軸が何を見ているか」で並べる。
 *
 * 説明文は用語解説をそのまま使う。強み用・弱み用に別の文章を書き起こすと
 * 軸の数だけ二重管理になるうえ、同じ軸の意味が二通りに散らばってしまう。
 * 解説が未登録の軸は名前だけを出す。
 */
function ExtremeList({
  codes,
  lang,
  ns,
}: {
  codes: string[];
  lang: Lang;
  ns: string | undefined;
}) {
  return (
    <ul>
      {codes.map((code) => {
        const label = axisLabel(code, lang, ns);
        const text = ns ? glossaryText({ ns, code, label }, lang) : undefined;
        return (
          <li key={code}>
            <b>{label}</b>
            {text && <span>{text}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 数値から組み立てた解説文。
 *
 * どの軸がどれだけ突出しているかの判断はバックエンドが済ませていて、ここは
 * 一文ずつ訳して連結するだけ。値の計算はしない（フロントで再計算しない方針）。
 * 訳の無い一文は落とす。全滅したときだけ段落ごと出さない。
 */
function ExtremeNote({
  segments,
  lang,
  ns,
}: {
  segments: NarrativeSegment[];
  lang: Lang;
  ns: string | undefined;
}) {
  const text = useMemo(() => {
    const axisJoin = findMessage(lang, "fortune.narrative.axisJoin") ?? "";
    const sentenceJoin = findMessage(lang, "fortune.narrative.sentenceJoin") ?? "";
    return segments
      .map((segment) => {
        const params: Record<string, string> = {
          axis: segment.codes.map((code) => axisLabel(code, lang, ns)).join(axisJoin),
        };
        for (const [name, value] of Object.entries(segment.params)) {
          params[name] = formatValue(value);
        }
        return findMessage(lang, `fortune.narrative.${segment.key}`, params) ?? "";
      })
      .filter(Boolean)
      .join(sentenceJoin);
  }, [segments, lang, ns]);

  return text ? <p className="chart-note">{text}</p> : null;
}

/**
 * レーダーチャート1枚分（表題・図・数値表）。
 * 用語ポップアップの開閉で他のカードまで描き直さないよう memo 化する。
 */
export const ChartCard = memo(function ChartCard({ chart, onSelectTerm }: Props) {
  const { t, lang } = useI18n();

  // 表題・説明はチャートの key で引く（バックエンドが増やしても落ちないよう任意扱い）
  const title = findMessage(lang, `fortune.charts.${chart.key}.title`) ?? chart.key;
  const note = findMessage(lang, `fortune.charts.${chart.key}.note`) ?? "";

  // 種別（ns）は「死」のように意味が重なる軸の訳し分けにも使う
  const ns = chartTermNs(chart.key);

  const points = useMemo(
    () =>
      chart.axes.map((axis) => ({
        label: axisLabel(axis.code, lang, ns),
        value: axis.value,
      })),
    [chart, lang, ns],
  );

  // 解説文がある軸だけクリックできるようにする（空のポップアップを出さない）
  const terms = points.map((point, i): TermRef | null => {
    if (!ns) return null;
    const ref = { ns, code: chart.axes[i].code, label: point.label };
    return glossaryText(ref, lang) ? ref : null;
  });

  const openTerm = terms.some(Boolean)
    ? (index: number) => {
        const ref = terms[index];
        if (ref) onSelectTerm(ref);
      }
    : undefined;

  return (
    <figure className="chart-card">
      <figcaption>
        <h3>{title}</h3>
        {note && <p>{note}</p>}
      </figcaption>

      <RadarChart
        points={points}
        maxValue={chart.max_value}
        title={title}
        onSelectAxis={openTerm}
      />

      {/* 図を読み取らなくても、どこが突出して高い／低いかを言葉で分かるようにする。
          並びが平坦なチャートでは順位に意味がないので、バックエンドが空で返す。 */}
      {(chart.strengths.length > 0 || chart.weaknesses.length > 0) && (
        <dl className="chart-extremes">
          {chart.strengths.length > 0 && (
            <div className="chart-extreme chart-extreme--strong">
              <dt>{t("fortune.charts.strengths")}</dt>
              <dd>
                <ExtremeList codes={chart.strengths} lang={lang} ns={ns} />
                <ExtremeNote segments={chart.strength_note} lang={lang} ns={ns} />
              </dd>
            </div>
          )}
          {chart.weaknesses.length > 0 && (
            <div className="chart-extreme chart-extreme--weak">
              <dt>{t("fortune.charts.weaknesses")}</dt>
              <dd>
                <ExtremeList codes={chart.weaknesses} lang={lang} ns={ns} />
                <ExtremeNote segments={chart.weakness_note} lang={lang} ns={ns} />
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* チャートと同じ内容を数値でも読めるようにしておく */}
      <details className="chart-table">
        <summary>{t("fortune.charts.showValues")}</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{t("fortune.charts.axis")}</th>
              <th scope="col">{t("fortune.charts.value")}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, i) => (
              <tr key={point.label}>
                <th scope="row">
                  {terms[i] && openTerm ? (
                    <button type="button" className="term-link" onClick={() => openTerm(i)}>
                      {point.label}
                    </button>
                  ) : (
                    point.label
                  )}
                </th>
                <td>{formatValue(point.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="chart-scale">
          {t("fortune.charts.scale", { max: formatValue(chart.max_value) })}
        </p>
      </details>
    </figure>
  );
});
