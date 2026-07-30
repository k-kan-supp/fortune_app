import { useState } from "react";
import { useI18n } from "@/i18n";
import { chartTermNs, type TermRef } from "../glossary";
import { axisLabel } from "../terms";
import type { RadarChart as RadarChartData } from "../types";
import { formatValue, RadarChart } from "./RadarChart";
import { TermModal } from "./TermModal";

interface Props {
  charts: RadarChartData[];
}

/** 表題と説明文を i18n から引けるチャート。並び順はバックエンドに従う。 */
const KNOWN_KEYS = [
  "five_elements",
  "ten_stems",
  "twelve_branches",
  "ten_gods",
  "ten_god_groups",
  "twelve_stages",
  "pillar_energy",
  "seasonal_states",
  "personality",
  "life_areas",
] as const;

type ChartKey = (typeof KNOWN_KEYS)[number];

const isKnown = (key: string): key is ChartKey =>
  (KNOWN_KEYS as readonly string[]).includes(key);

/** 命式のバランス指標をレーダーチャートで一覧する。 */
export function AnalysisCharts({ charts }: Props) {
  const { t, lang } = useI18n();
  // 軸をクリックすると、その用語の意味をポップアップで出す
  const [term, setTerm] = useState<TermRef | null>(null);

  return (
    <>
      <p className="hint charts-hint">{t("glossary.hint")}</p>

      <div className="charts-grid">
        {charts.map((chart) => {
          const title = isKnown(chart.key) ? t(`fortune.charts.${chart.key}.title`) : chart.key;
          const note = isKnown(chart.key) ? t(`fortune.charts.${chart.key}.note`) : "";
          const points = chart.axes.map((axis) => ({
            label: axisLabel(axis.code, lang),
            value: axis.value,
          }));

          const ns = chartTermNs(chart.key);
          const openTerm = (index: number) => {
            if (!ns) return;
            setTerm({ ns, code: chart.axes[index].code, label: points[index].label });
          };

          return (
            <figure key={chart.key} className="chart-card">
              <figcaption>
                <h3>{title}</h3>
                {note && <p>{note}</p>}
              </figcaption>

              <RadarChart
                points={points}
                maxValue={chart.max_value}
                title={title}
                onSelectAxis={ns ? openTerm : undefined}
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
                          {ns ? (
                            <button
                              type="button"
                              className="term-link"
                              onClick={() => openTerm(i)}
                            >
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
        })}
      </div>

      {term && <TermModal term={term} onClose={() => setTerm(null)} />}
    </>
  );
}
