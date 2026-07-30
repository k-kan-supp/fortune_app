import { useMemo, useState } from "react";
import { GENDERS, PREFECTURES, toOptions } from "@/features/profile/constants";
import { useI18n } from "@/i18n";
import { prefectureLabel } from "@/i18n/prefectures";
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
  const { t, lang } = useI18n();

  const genderOptions = toOptions(GENDERS, t);
  const prefOptions = useMemo(
    () => PREFECTURES.map((p) => ({ value: p, label: prefectureLabel(p, lang) })),
    [lang],
  );

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
        {open ? t("filter.close") : t("filter.open")}
      </button>

      {open && (
        <div className="filter-panel">
          <label>
            {t("filter.gender")}
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">{t("common.any")}</option>
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t("filter.age")}
            <span className="age-range">
              <input
                type="number"
                placeholder={t("filter.minAge")}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
              〜
              <input
                type="number"
                placeholder={t("filter.maxAge")}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </span>
          </label>

          <label>
            {t("filter.area")}
            <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
              <option value="">{t("common.any")}</option>
              {prefOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <div className="filter-actions">
            <button className="pass-btn" onClick={reset}>
              {t("filter.reset")}
            </button>
            <button className="like-btn" onClick={apply}>
              {t("filter.apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
