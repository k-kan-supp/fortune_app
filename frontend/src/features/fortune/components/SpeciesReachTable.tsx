import { useI18n } from "@/i18n";
import { formatPeople } from "../peopleCount";
import { speciesName } from "../terms";
import type { SpeciesReach } from "../types";

/**
 * 関係ごとの列。バックエンドの RELATIONS と同じ並びにする。
 * 「恋人には向くが仕事では組めない」といった差がこの表の読みどころなので、
 * 関係を並べて見比べられる形にする。
 */
const RELATIONS = ["lover", "colleague", "business", "spouse"] as const;

/**
 * 相性が高い種族と、関係ごとに向いている人数のマトリクス。
 *
 * 行の順は総合点。関係ごとに並べ替えると行の意味が列ごとに変わって読めなくなる。
 * セルには人数を出しつつ、その種族の中での割合を帯で重ねる ── 人数だけだと
 * 母数の大きい種族が常に上に見えてしまう。
 */
export function SpeciesReachTable({ reach }: { reach: SpeciesReach[] }) {
  const { t, lang } = useI18n();
  if (reach.length === 0) return null;

  return (
    <section className="reach-table">
      <h3>{t("fortune.reach.title")}</h3>
      <p className="hint">{t("fortune.reach.hint")}</p>

      <div className="reach-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">{t("fortune.reach.species")}</th>
              <th scope="col">{t("fortune.reach.people")}</th>
              {RELATIONS.map((relation) => (
                <th key={relation} scope="col">
                  {t(`fortune.reach.relations.${relation}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reach.map((row) => (
              <tr key={row.code}>
                <th scope="row">
                  <b>{speciesName(row.code, lang)}</b>
                  <span className="reach-table__code">{row.code}</span>
                </th>
                <td className="reach-table__total">{formatPeople(row.people, lang)}</td>
                {RELATIONS.map((relation) => {
                  const people = row.suited[relation] ?? 0;
                  const share = row.people > 0 ? (people / row.people) * 100 : 0;
                  return (
                    <td key={relation}>
                      {/* 帯は装飾。読み取りに要る数値は必ず文字でも出す */}
                      <span
                        className="reach-table__bar"
                        style={{ width: `${share.toFixed(0)}%` }}
                        aria-hidden="true"
                      />
                      <span className="reach-table__value">{formatPeople(people, lang)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
