import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n";
import { prefectureLabel } from "@/i18n/prefectures";
import {
  BLOOD_TYPES,
  BODY_TYPES,
  DRINKING_STATUSES,
  EDUCATIONS,
  GENDERS,
  MARITAL_STATUSES,
  PREFECTURES,
  SMOKING_STATUSES,
  toOptions,
} from "../constants";
import type { Profile, ProfileUpdate } from "../types";
import { Section, SelectField, TextField } from "./fields";

interface Props {
  profile: Profile;
  onSave: (data: ProfileUpdate) => void;
}

/** プロフィール（基本情報 + マッチング項目）を編集するフォーム。 */
export function ProfileForm({ profile, onSave }: Props) {
  const [form, setForm] = useState<ProfileUpdate>({});
  const [saved, setSaved] = useState(false);
  const { t, lang } = useI18n();

  const prefOptions = useMemo(
    () => PREFECTURES.map((p) => ({ value: p, label: prefectureLabel(p, lang) })),
    [lang],
  );

  // プロフィール読込後にフォーム初期値を反映（HH:MM:SS → HH:MM）
  useEffect(() => {
    setForm({ ...profile, birth_time: profile.birth_time?.slice(0, 5) ?? null });
  }, [profile]);

  // 文字列で受けたセレクト/テキスト値を該当キーに反映する
  function set<K extends keyof ProfileUpdate>(key: K, value: ProfileUpdate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setNum(key: "height_cm" | "weight_kg", v: string | null) {
    set(key, v === null ? null : Number(v));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave(form);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <Section title={t("profile.sections.basic")}>
        <TextField
          label={t("profile.fields.displayName")}
          value={form.display_name ?? null}
          maxLength={50}
          onChange={(v) => set("display_name", v)}
        />
        <TextField
          label={t("profile.fields.birthday")}
          type="date"
          value={form.birthday ?? null}
          onChange={(v) => set("birthday", v)}
        />
        <TextField
          label={t("profile.fields.birthTime")}
          type="time"
          value={form.birth_time ?? null}
          onChange={(v) => set("birth_time", v)}
        />
        <SelectField
          label={t("profile.fields.gender")}
          value={form.gender ?? null}
          options={toOptions(GENDERS, t)}
          onChange={(v) => set("gender", v as Profile["gender"])}
        />
      </Section>

      <Section title={t("profile.sections.physical")}>
        <TextField
          label={t("profile.fields.height")}
          type="number"
          suffix="cm"
          value={form.height_cm ?? null}
          onChange={(v) => setNum("height_cm", v)}
        />
        <TextField
          label={t("profile.fields.weight")}
          type="number"
          suffix="kg"
          value={form.weight_kg ?? null}
          onChange={(v) => setNum("weight_kg", v)}
        />
        <SelectField
          label={t("profile.fields.bodyType")}
          value={form.body_type ?? null}
          options={toOptions(BODY_TYPES, t)}
          onChange={(v) => set("body_type", v as Profile["body_type"])}
        />
        <SelectField
          label={t("profile.fields.bloodType")}
          value={form.blood_type ?? null}
          options={toOptions(BLOOD_TYPES, t)}
          onChange={(v) => set("blood_type", v as Profile["blood_type"])}
        />
      </Section>

      <Section title={t("profile.sections.details")}>
        <TextField
          label={t("profile.fields.occupation")}
          value={form.occupation ?? null}
          maxLength={50}
          onChange={(v) => set("occupation", v)}
        />
        <SelectField
          label={t("profile.fields.education")}
          value={form.education ?? null}
          options={toOptions(EDUCATIONS, t)}
          onChange={(v) => set("education", v as Profile["education"])}
        />
        <SelectField
          label={t("profile.fields.prefecture")}
          value={form.prefecture ?? null}
          options={prefOptions}
          onChange={(v) => set("prefecture", v)}
        />
        <SelectField
          label={t("profile.fields.maritalStatus")}
          value={form.marital_status ?? null}
          options={toOptions(MARITAL_STATUSES, t)}
          onChange={(v) => set("marital_status", v as Profile["marital_status"])}
        />
        <SelectField
          label={t("profile.fields.smoking")}
          value={form.smoking ?? null}
          options={toOptions(SMOKING_STATUSES, t)}
          onChange={(v) => set("smoking", v as Profile["smoking"])}
        />
        <SelectField
          label={t("profile.fields.drinking")}
          value={form.drinking ?? null}
          options={toOptions(DRINKING_STATUSES, t)}
          onChange={(v) => set("drinking", v as Profile["drinking"])}
        />
      </Section>

      <Section title={t("profile.sections.about")}>
        <label>
          <textarea
            rows={5}
            maxLength={1000}
            placeholder={t("profile.bioPlaceholder")}
            value={form.bio ?? ""}
            onChange={(e) => set("bio", e.target.value || null)}
          />
        </label>
      </Section>

      <div className="form-footer">
        <button type="submit">{t("common.save")}</button>
        {saved && <span className="saved-note">{t("profile.saved")}</span>}
      </div>
    </form>
  );
}
