import { findMessage, useI18n, type MessageKey } from "@/i18n";
import { formatPeople } from "../peopleCount";
import { formatValue } from "../radarGeometry";
import { SpeciesIcon } from "../speciesIcons";
import { SpeciesReachTable } from "./SpeciesReachTable";
import { axisLabel, speciesName } from "../terms";
import type { FortuneResponse } from "../types";

/**
 * サマリーに並べる 3 つの山。
 * どの軸が突出しているかはバックエンドが判定済みなので、ここは
 * その ``strengths`` の先頭を拾って表示するだけ（順位を付け直さない）。
 */
const PEAKS: { chart: string; ns: string; labelKey: MessageKey }[] = [
  { chart: "five_elements", ns: "element", labelKey: "fortune.summary.elementPeak" },
  { chart: "personality", ns: "personality", labelKey: "fortune.summary.traitPeak" },
  { chart: "life_areas", ns: "lifeArea", labelKey: "fortune.summary.areaPeak" },
];

/**
 * 鑑定結果の頭に出すサマリー。
 * 命式を 25 種族のどれかに当てはめ、判定の根拠と突出した軸を添える。
 * 種族を返さない古い API のときは、まるごと出さない。
 */
export function ResultSummary({ result }: { result: FortuneResponse }) {
  const { t, lang } = useI18n();
  const species = result.species;
  if (!species) return null;

  const name = speciesName(species.code, lang);
  const compatible = result.compatible;
  const tagline = findMessage(lang, `fortune.species.${species.code}.tagline`);

  const peaks = PEAKS.flatMap((peak) => {
    const chart = result.charts?.find((c) => c.key === peak.chart);
    const code = chart?.strengths[0];
    if (!chart || !code) return [];
    const axis = chart.axes.find((a) => a.code === code);
    return [
      {
        key: peak.chart,
        label: t(peak.labelKey),
        name: axisLabel(code, lang, peak.ns),
        value: axis ? formatValue(axis.value) : "",
        max: formatValue(chart.max_value),
      },
    ];
  });

  return (
    <section className="species-summary">
      <div className="species-head">
        <span className="species-art">
          <SpeciesIcon code={species.code} />
        </span>
        <div className="species-title">
          <p className="species-eyebrow">
            {t("fortune.summary.eyebrow")}
            <span className="species-code">{species.code}</span>
          </p>
          <h2 className="species-name">{name}</h2>
        </div>
      </div>

      {tagline && <p className="species-tagline">{tagline}</p>}

      <p className="species-basis">
        {t("fortune.summary.basis", {
          stem: axisLabel(result.day_master, lang, "stem"),
          element: axisLabel(species.element, lang, "element"),
          group: axisLabel(species.group, lang, "tenGodGroup"),
        })}
        <span className="species-share">
          {t("fortune.summary.share", { share: formatValue(species.group_share) })}
        </span>
      </p>

      {peaks.length > 0 && (
        <dl className="species-peaks">
          {peaks.map((peak) => (
            <div key={peak.key}>
              <dt>{peak.label}</dt>
              <dd>
                <b>{peak.name}</b>
                <span>
                  {peak.value} / {peak.max}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {compatible && compatible.people > 0 && (
        <div className="species-reach">
          <p className="species-reach__lead">
            {t("fortune.summary.reachLead", {
              people: formatPeople(compatible.people, lang),
              oneIn: formatValue(compatible.one_in),
            })}
          </p>
          {/* 母数と時点を必ず添える。桁だけ出して根拠を隠さない */}
          <p className="species-reach__basis">
            {t("fortune.summary.reachBasis", {
              basis: formatPeople(compatible.basis, lang),
              asOf: compatible.as_of,
              kinds: compatible.species_codes.length,
            })}
          </p>
          <SpeciesReachTable reach={compatible.reach} />
        </div>
      )}

      <p className="species-count">{t("fortune.summary.typeCount")}</p>
    </section>
  );
}
