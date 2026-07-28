import type { FortuneResponse, Pillar } from "../types";

interface Props {
  result: FortuneResponse;
}

const COLUMNS: { label: string; key: keyof FortuneResponse }[] = [
  { label: "年柱", key: "year_pillar" },
  { label: "月柱", key: "month_pillar" },
  { label: "日柱", key: "day_pillar" },
  { label: "時柱", key: "hour_pillar" },
];

/** 命式（四柱）を表形式で表示する。 */
export function MeishikiTable({ result }: Props) {
  return (
    <div className="meishiki">
      <p className="day-master">日主: {result.day_master}</p>
      <table>
        <thead>
          <tr>
            <th></th>
            {COLUMNS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>天干</th>
            {COLUMNS.map((c) => {
              const p = result[c.key] as Pillar;
              return <td key={c.key}>{p.stem}（{p.ten_god ?? "—"}）</td>;
            })}
          </tr>
          <tr>
            <th>地支</th>
            {COLUMNS.map((c) => {
              const p = result[c.key] as Pillar;
              return <td key={c.key}>{p.branch}</td>;
            })}
          </tr>
          <tr>
            <th>蔵干</th>
            {COLUMNS.map((c) => {
              const p = result[c.key] as Pillar;
              return <td key={c.key}>{p.hidden_stems.join("・")}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
