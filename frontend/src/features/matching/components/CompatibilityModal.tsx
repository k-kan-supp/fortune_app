import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { axisLabel } from "@/features/fortune/terms";
import { findMessage, useI18n } from "@/i18n";
import { useCompatibility } from "../hooks/useCompatibility";
import { CompareRadar } from "./CompareRadar";

interface Props {
  userId: string;
  /** 見出しに出す相手の名前。 */
  name: string;
  onClose: () => void;
}

/** 候補カードをタップしたときに出る、四柱推命の相性ポップアップ。 */
export function CompatibilityModal({ userId, name, onClose }: Props) {
  const { result, error } = useCompatibility(userId);
  const { t, lang } = useI18n();

  return (
    <Modal onClose={onClose} cardClassName="compat-modal-card" labelledBy="compat-modal-title">
      <div className="term-modal-head">
        <p className="term-modal-eyebrow">{t("compat.title")}</p>
        <ModalCloseButton onClose={onClose} />
      </div>

      <h2 id="compat-modal-title">{name}</h2>

      {error && <p className="error">{error}</p>}
      {!result && !error && <p className="hint">{t("common.loading")}</p>}

      {result && (
        <>
          <p className="compat-score">
            <span className="compat-score-value">{Math.round(result.score)}</span>
            <span className="compat-score-unit">/ 100</span>
          </p>

          <ul className="compat-facets">
            {result.facets.map((facet) => (
              <li key={facet.code}>
                <span className="compat-facet-label">
                  {findMessage(lang, `compat.facets.${facet.code}`) ?? facet.code}
                </span>
                <span className="compat-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, Math.min(facet.value, 100))}%` }} />
                </span>
                <span className="compat-facet-value">{Math.round(facet.value)}</span>
                {/* その面が何を見ているかを一行添える */}
                <span className="compat-facet-note">
                  {findMessage(lang, `compat.facetNotes.${facet.code}`) ?? ""}
                </span>
              </li>
            ))}
          </ul>

          <ul className="compat-notes">
            {result.notes.map((note) => (
              <li key={note}>{findMessage(lang, `compat.notes.${note}`) ?? note}</li>
            ))}
          </ul>

          {/* その判断の元になった構成比を、二人分重ねて見せる */}
          {result.charts.length > 0 && (
            <section className="compat-charts">
              <h3>{t("compat.chartsTitle")}</h3>
              <p className="hint">{t("compat.chartsHint")}</p>
              {result.charts.map((chart) => {
                const title =
                  findMessage(lang, `compat.charts.${chart.key}`) ?? chart.key;
                return (
                  <figure key={chart.key} className="compat-chart">
                    <figcaption>{title}</figcaption>
                    <CompareRadar
                      // 相性は占いを知らない人も読むので、軸名も言い換えを優先する
                      labels={chart.axes.map(
                        (code) =>
                          findMessage(lang, `compat.axisLabels.${code}`) ?? axisLabel(code, lang),
                      )}
                      you={chart.you}
                      them={chart.them}
                      maxValue={chart.max_value}
                      highlight={chart.highlight.map((code) => chart.axes.indexOf(code))}
                      youLabel={t("compat.you")}
                      themLabel={name}
                      title={title}
                    />
                  </figure>
                );
              })}
            </section>
          )}
        </>
      )}
    </Modal>
  );
}
