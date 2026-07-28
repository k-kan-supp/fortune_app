import { useState } from "react";
import { GENDERS, PREFECTURES } from "@/features/profile/constants";
import type { CandidateFilters } from "../api/matchingApi";

interface Props {
  onApply: (filters: CandidateFilters) => void;
}

/** 候補の絞り込みパネル（性別・年齢・エリア）。 */
export function CandidateFilter({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [prefecture, setPrefecture] = useState("");

  function apply() {
    onApply({
      gender: gender || undefined,
      min_age: minAge ? Number(minAge) : undefined,
      max_age: maxAge ? Number(maxAge) : undefined,
      prefecture: prefecture || undefined,
    });
    setOpen(false);
  }

  function reset() {
    setGender("");
    setMinAge("");
    setMaxAge("");
    setPrefecture("");
    onApply({});
    setOpen(false);
  }

  return (
    <div className="filter">
      <button className="link-btn" onClick={() => setOpen((v) => !v)}>
        {open ? "絞り込みを閉じる" : "絞り込み"}
      </button>

      {open && (
        <div className="filter-panel">
          <label>
            性別
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">指定なし</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            年齢
            <span className="age-range">
              <input
                type="number"
                placeholder="下限"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
              〜
              <input
                type="number"
                placeholder="上限"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </span>
          </label>

          <label>
            エリア
            <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
              <option value="">指定なし</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <div className="filter-actions">
            <button className="pass-btn" onClick={reset}>
              リセット
            </button>
            <button className="like-btn" onClick={apply}>
              この条件でさがす
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
