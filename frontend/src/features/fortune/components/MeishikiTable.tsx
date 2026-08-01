import { useState } from "react";
import { useI18n, type MessageKey } from "@/i18n";
import type { TermRef } from "../glossary";
import { branchLabel, hiddenStemsLabel, stemLabel, tenGodLabel } from "../terms";
import type { FortuneResponse, Pillar } from "../types";
import { TermModal } from "./TermModal";

interface Props {
  result: FortuneResponse;
}

const COLUMNS: { labelKey: MessageKey; key: keyof FortuneResponse }[] = [
  { labelKey: "fortune.table.yearPillar", key: "year_pillar" },
  { labelKey: "fortune.table.monthPillar", key: "month_pillar" },
  { labelKey: "fortune.table.dayPillar", key: "day_pillar" },
  { labelKey: "fortune.table.hourPillar", key: "hour_pillar" },
];

/** 命式（四柱）を表形式で表示する。英語では干支に訳語を添える。 */
export function MeishikiTable({ result }: Props) {
  const { t, lang } = useI18n();
  // 「日主」と日主の天干は、クリックで意味を出す
  const [term, setTerm] = useState<TermRef | null>(null);

  return (
    <div className="meishiki">
      <p className="day-master">
        <button
          type="button"
          className="term-link"
          onClick={() =>
            setTerm({
              ns: "table",
              code: "dayMaster",
              label: t("fortune.table.dayMaster"),
            })
          }
        >
          {t("fortune.table.dayMaster")}
        </button>
        :{" "}
        <button
          type="button"
          className="term-link"
          onClick={() =>
            setTerm({
              ns: "stem",
              code: result.day_master,
              label: stemLabel(result.day_master, lang),
            })
          }
        >
          {stemLabel(result.day_master, lang)}
        </button>
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            {COLUMNS.map((c) => (
              <th key={c.key}>{t(c.labelKey)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{t("fortune.table.stem")}</th>
            {COLUMNS.map((c) => {
              const p = result[c.key] as Pillar;
              return (
                <td key={c.key}>
                  {stemLabel(p.stem, lang)}（{p.ten_god ? tenGodLabel(p.ten_god, lang) : "—"}）
                </td>
              );
            })}
          </tr>
          <tr>
            <th>{t("fortune.table.branch")}</th>
            {COLUMNS.map((c) => {
              const p = result[c.key] as Pillar;
              return <td key={c.key}>{branchLabel(p.branch, lang)}</td>;
            })}
          </tr>
          <tr>
            <th>{t("fortune.table.hiddenStems")}</th>
            {COLUMNS.map((c) => {
              const p = result[c.key] as Pillar;
              return <td key={c.key}>{hiddenStemsLabel(p.hidden_stems, lang)}</td>;
            })}
          </tr>
        </tbody>
      </table>

      {term && <TermModal term={term} onClose={() => setTerm(null)} />}
    </div>
  );
}
