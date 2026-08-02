import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { formatPeople } from "../peopleCount";
import { speciesName } from "../terms";
import type { RelationRanking } from "../types";

/** 表示順。バックエンドの RELATIONS と同じ並びにする。 */
const RELATIONS = ["lover", "colleague", "business", "spouse"] as const;
type Relation = (typeof RELATIONS)[number];

/** 並べ替えの対象。既定はその関係の相性（割合）順。 */
type SortKey = "share" | "people";

const isRelation = (value: string): value is Relation =>
  (RELATIONS as readonly string[]).includes(value);

/**
 * 関係ごとの相性ランキング。
 *
 * 関係を列に並べず**タブで切り替える**。同じ10種族に4列を並べると、どの列も
 * 総合点で選ばれた同じ顔ぶれになり、関係ごとの違いが出ない。関係ごとに全25種族
 * から選び直すと顔ぶれ自体が変わる ── 総合点の上位10に一度も入らない種族が、
 * ある関係では上位に来る。
 *
 * 数字は人数、バーと％は**その種族のうち向いている割合**。順位は割合で付ける。
 * 人数で並べると、構成比の大きい種族がどの関係でも上に来てしまい、
 * 「相性が良い」を表さない。
 */
export function SpeciesReachTable({ rankings }: { rankings: RelationRanking[] }) {
  const { t, lang } = useI18n();
  const [active, setActive] = useState<Relation>("lover");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "share", desc: true });

  const current = useMemo(
    () => rankings.find((entry) => entry.relation === active),
    [rankings, active],
  );

  const rows = useMemo(() => {
    const source = current?.rows ?? [];
    const scored = source.map((row, index) => ({ row, index }));
    scored.sort((a, b) => {
      const key = sort.key === "people" ? "people" : "share";
      const gap = b.row[key] - a.row[key];
      return gap !== 0 ? gap : a.index - b.index;
    });
    if (!sort.desc) scored.reverse();
    return scored.map((entry) => entry.row);
  }, [current, sort]);

  const tabs = rankings.filter((entry) => isRelation(entry.relation) && entry.rows.length > 0);
  if (tabs.length === 0) return null;

  const toggle = (key: SortKey) =>
    setSort((current) => ({ key, desc: current.key === key ? !current.desc : true }));

  const ariaSort = (key: SortKey) =>
    sort.key === key ? (sort.desc ? "descending" : "ascending") : "none";

  // ★ は割合の最上位に付ける。人数で並べ替えても位置がずれないよう、印は割合で決める。
  const bestCode = [...(current?.rows ?? [])].sort((a, b) => b.share - a.share)[0]?.code;

  return (
    <section className="reach-table" data-rel={active}>
      <h3>{t("fortune.reach.title")}</h3>
      <p className="hint">{t("fortune.reach.hint")}</p>

      {/* 関係ごとに顔ぶれが変わるので、切り替えたら順位表ごと入れ替わる */}
      <div className="reach-tabs" role="tablist" aria-label={t("fortune.reach.title")}>
        {tabs.map((entry) => {
          const relation = entry.relation as Relation;
          const selected = relation === active;
          return (
            <button
              key={relation}
              type="button"
              role="tab"
              aria-selected={selected}
              data-rel={relation}
              className={selected ? "is-active" : undefined}
              onClick={() => setActive(relation)}
            >
              <i className="reach-swatch" aria-hidden="true" />
              {t(`fortune.reach.relations.${relation}`)}
            </button>
          );
        })}
      </div>

      <div className="reach-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">{t("fortune.reach.species")}</th>
              <th scope="col" aria-sort={ariaSort("people")}>
                <button type="button" onClick={() => toggle("people")}>
                  {t("fortune.reach.people")}
                </button>
              </th>
              <th scope="col" data-rel={active} aria-sort={ariaSort("share")}>
                <button type="button" onClick={() => toggle("share")}>
                  {t("fortune.reach.suited")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isBest = row.code === bestCode;
              return (
                <tr key={row.code}>
                  <th scope="row">
                    <b>{speciesName(row.code, lang)}</b>
                    <span className="reach-table__code">{row.code}</span>
                  </th>
                  <td className="reach-table__total">{formatPeople(row.people, lang)}</td>
                  <td
                    data-rel={active}
                    className={isBest ? "is-best" : undefined}
                    title={t("fortune.reach.cell", {
                      people: row.suited.toLocaleString(lang === "ja" ? "ja-JP" : "en-US"),
                      share: row.share.toFixed(0),
                    })}
                  >
                    <span className="reach-cell__head">
                      <span className="reach-cell__value">{formatPeople(row.suited, lang)}</span>
                      <span className="reach-cell__share">{row.share.toFixed(0)}%</span>
                      {/* 色だけに頼らせない。最上位には印を付ける */}
                      {isBest && (
                        <span className="reach-cell__mark">
                          <span aria-hidden="true">★</span>
                          <span className="sr-only">{t("fortune.reach.best")}</span>
                        </span>
                      )}
                    </span>
                    <span className="reach-cell__bar">
                      <i style={{ width: `${row.share.toFixed(1)}%` }} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
