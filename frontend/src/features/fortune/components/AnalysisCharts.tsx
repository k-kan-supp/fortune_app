import { useState } from "react";
import { useI18n } from "@/i18n";
import type { TermRef } from "../glossary";
import type { RadarChart as RadarChartData } from "../types";
import { ChartCard } from "./ChartCard";
import { TermModal } from "./TermModal";

interface Props {
  charts: RadarChartData[];
}

/** 命式のバランス指標をレーダーチャートで一覧する。並び順はバックエンドに従う。 */
export function AnalysisCharts({ charts }: Props) {
  const { t } = useI18n();
  // 軸をクリックすると、その用語の意味をポップアップで出す
  const [term, setTerm] = useState<TermRef | null>(null);

  return (
    <>
      <p className="hint charts-hint">{t("glossary.hint")}</p>

      <div className="charts-grid">
        {charts.map((chart) => (
          <ChartCard key={chart.key} chart={chart} onSelectTerm={setTerm} />
        ))}
      </div>

      {term && <TermModal term={term} onClose={() => setTerm(null)} />}
    </>
  );
}
