import { memo, useMemo } from "react";
import { findMessage, useI18n } from "@/i18n";
import { chartTermNs, glossaryText, type TermRef } from "../glossary";
import { axisLabel } from "../terms";
import type { RadarChart as RadarChartData } from "../types";
import { formatValue, RadarChart } from "./RadarChart";

interface Props {
  chart: RadarChartData;
  /** 軸がクリックされたときに用語解説を開く。 */
  onSelectTerm: (term: TermRef) => void;
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
