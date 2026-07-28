import { useEffect, useState, type FormEvent } from "react";
import {
  BLOOD_TYPES,
  BODY_TYPES,
  DRINKING_STATUSES,
  EDUCATIONS,
  GENDERS,
  MARITAL_STATUSES,
  PREFECTURES,
  SMOKING_STATUSES,
} from "../constants";
import type { Profile, ProfileUpdate } from "../types";
import { Section, SelectField, TextField } from "./fields";

interface Props {
  profile: Profile;
  onSave: (data: ProfileUpdate) => void;
}

const PREF_OPTIONS = PREFECTURES.map((p) => ({ value: p, label: p }));

/** プロフィール（基本情報 + マッチング項目）を編集するフォーム。 */
export function ProfileForm({ profile, onSave }: Props) {
  const [form, setForm] = useState<ProfileUpdate>({});
  const [saved, setSaved] = useState(false);

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
      <Section title="基本情報">
        <TextField
          label="表示名"
          value={form.display_name ?? null}
          maxLength={50}
          onChange={(v) => set("display_name", v)}
        />
        <TextField
          label="生年月日"
          type="date"
          value={form.birthday ?? null}
          onChange={(v) => set("birthday", v)}
        />
        <TextField
          label="出生時刻"
          type="time"
          value={form.birth_time ?? null}
          onChange={(v) => set("birth_time", v)}
        />
        <SelectField
          label="性別"
          value={form.gender ?? null}
          options={GENDERS}
          onChange={(v) => set("gender", v as Profile["gender"])}
        />
      </Section>

      <Section title="身体・基本スペック">
        <TextField
          label="身長"
          type="number"
          suffix="cm"
          value={form.height_cm ?? null}
          onChange={(v) => setNum("height_cm", v)}
        />
        <TextField
          label="体重"
          type="number"
          suffix="kg"
          value={form.weight_kg ?? null}
          onChange={(v) => setNum("weight_kg", v)}
        />
        <SelectField
          label="体型"
          value={form.body_type ?? null}
          options={BODY_TYPES}
          onChange={(v) => set("body_type", v as Profile["body_type"])}
        />
        <SelectField
          label="血液型"
          value={form.blood_type ?? null}
          options={BLOOD_TYPES}
          onChange={(v) => set("blood_type", v as Profile["blood_type"])}
        />
      </Section>

      <Section title="プロフィール詳細">
        <TextField
          label="職業"
          value={form.occupation ?? null}
          maxLength={50}
          onChange={(v) => set("occupation", v)}
        />
        <SelectField
          label="学歴"
          value={form.education ?? null}
          options={EDUCATIONS}
          onChange={(v) => set("education", v as Profile["education"])}
        />
        <SelectField
          label="居住地"
          value={form.prefecture ?? null}
          options={PREF_OPTIONS}
          onChange={(v) => set("prefecture", v)}
        />
        <SelectField
          label="婚姻歴"
          value={form.marital_status ?? null}
          options={MARITAL_STATUSES}
          onChange={(v) => set("marital_status", v as Profile["marital_status"])}
        />
        <SelectField
          label="喫煙"
          value={form.smoking ?? null}
          options={SMOKING_STATUSES}
          onChange={(v) => set("smoking", v as Profile["smoking"])}
        />
        <SelectField
          label="飲酒"
          value={form.drinking ?? null}
          options={DRINKING_STATUSES}
          onChange={(v) => set("drinking", v as Profile["drinking"])}
        />
      </Section>

      <Section title="自己紹介">
        <label>
          <textarea
            rows={5}
            maxLength={1000}
            placeholder="自己紹介を入力してください（1000文字まで）"
            value={form.bio ?? ""}
            onChange={(e) => set("bio", e.target.value || null)}
          />
        </label>
      </Section>

      <div className="form-footer">
        <button type="submit">保存する</button>
        {saved && <span className="saved-note">保存しました ✓</span>}
      </div>
    </form>
  );
}
