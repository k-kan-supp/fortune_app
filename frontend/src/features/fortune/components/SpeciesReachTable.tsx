import { useMemo, useState } from "react";
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
type Relation = (typeof RELATIONS)[number];

/** 並べ替えの対象。既定は総合点順（バックエンドが返した並び）。 */
type SortKey = "rank" | "people" | Relation;

const rate = (row: SpeciesReach, relation: Relation): number =>
  row.people > 0 ? (row.suited[relation] ?? 0) / row.people : 0;

/**
 * 相性が高い種族と、関係ごとに向いている人数のマトリクス。
 *
 * 数字は人数、バーは**割合**。この2つは一致しない ── 人数は種族の大きさに
 * 引きずられるので、構成比 13% の種族はどの列でも人数で勝つ。「相性が良い」の
 * 意味は割合のほうなので、★ は割合の最上位に付ける。実際、100 通りのうち
 * 76 通りで人数最大と割合最大が食い違う。
 *
 * 色は列の識別にだけ使う。同じことを見出しの文字が言っているので、色が
 * 読めなくても表は成立する。
 */
export function SpeciesReachTable({ reach }: { reach: SpeciesReach[] }) {
  const { t, lang } = useI18n();
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "rank", desc: true });

  /** 列ごとの最上位（割合）。同率なら先に出てくるほうを採る。 */
  const best = useMemo(() => {
    const found: Partial<Record<Relation, string>> = {};
    for (const relation of RELATIONS) {
      let top: SpeciesReach | undefined;
      for (const row of reach) {
        if (!top || rate(row, relation) > rate(top, relation)) top = row;
      }
      if (top) found[relation] = top.code;
    }
    return found;
  }, [reach]);

  const rows = useMemo(() => {
    if (sort.key === "rank") return reach;
    const scored = reach.map((row, index) => ({
      row,
      index,
      // 並べ替えは、その列が表示している数字（人数）で行う。見えていない値で
      // 並ぶと、なぜその順になったのかが読み取れない。
      value: sort.key === "people" ? row.people : (row.suited[sort.key] ?? 0),
    }));
    scored.sort((a, b) => (a.value === b.value ? a.index - b.index : b.value - a.value));
    if (!sort.desc) scored.reverse();
    return scored.map((entry) => entry.row);
  }, [reach, sort]);

  if (reach.length === 0) return null;

  const toggle = (key: SortKey) =>
    setSort((current) => ({ key, desc: current.key === key ? !current.desc : true }));

  const ariaSort = (key: SortKey) =>
    sort.key === key ? (sort.desc ? "descending" : "ascending") : "none";

  return (
    <section className="reach-table">
      <h3>{t("fortune.reach.title")}</h3>
      <p className="hint">{t("fortune.reach.hint")}</p>

      <div className="reach-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col" aria-sort={ariaSort("rank")}>
                <button type="button" onClick={() => toggle("rank")}>
                  {t("fortune.reach.species")}
                </button>
              </th>
              <th scope="col" aria-sort={ariaSort("people")}>
                <button type="button" onClick={() => toggle("people")}>
                  {t("fortune.reach.people")}
                </button>
              </th>
              {RELATIONS.map((relation) => (
                <th key={relation} scope="col" data-rel={relation} aria-sort={ariaSort(relation)}>
                  <button type="button" onClick={() => toggle(relation)}>
                    {/* 見出しの色見本が、そのまま列の凡例になる */}
                    <i className="reach-swatch" aria-hidden="true" />
                    {t(`fortune.reach.relations.${relation}`)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code}>
                <th scope="row">
                  <b>{speciesName(row.code, lang)}</b>
                  <span className="reach-table__code">{row.code}</span>
                </th>
                <td className="reach-table__total">{formatPeople(row.people, lang)}</td>
                {RELATIONS.map((relation) => {
                  const people = row.suited[relation] ?? 0;
                  const share = rate(row, relation) * 100;
                  const isBest = best[relation] === row.code;
                  return (
                    <td
                      key={relation}
                      data-rel={relation}
                      className={isBest ? "is-best" : undefined}
                      title={t("fortune.reach.cell", {
                        people: people.toLocaleString(lang === "ja" ? "ja-JP" : "en-US"),
                        share: share.toFixed(0),
                      })}
                    >
                      <span className="reach-cell__head">
                        <span className="reach-cell__value">{formatPeople(people, lang)}</span>
                        <span className="reach-cell__share">{share.toFixed(0)}%</span>
                        {/* 色だけに頼らせない。最上位には印を付ける */}
                        {isBest && (
                          <span className="reach-cell__mark">
                            <span aria-hidden="true">★</span>
                            <span className="sr-only">{t("fortune.reach.best")}</span>
                          </span>
                        )}
                      </span>
                      <span className="reach-cell__bar">
                        <i style={{ width: `${share.toFixed(1)}%` }} />
                      </span>
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
