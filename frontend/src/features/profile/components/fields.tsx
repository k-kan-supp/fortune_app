import type { ReactNode } from "react";
import { useI18n } from "@/i18n";

interface Option {
  value: string;
  label: string;
}

/** ラベル付きセレクト。未選択は空文字で表し、onChange では null に正規化する。 */
export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (v: string | null) => void;
}) {
  const { t } = useI18n();

  return (
    <label>
      {label}
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">{t("common.notSelected")}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** ラベル付きテキスト/数値入力。数値は空なら null を返す。 */
export function TextField({
  label,
  value,
  type = "text",
  suffix,
  maxLength,
  onChange,
}: {
  label: string;
  value: string | number | null;
  type?: "text" | "number" | "date" | "time";
  suffix?: string;
  maxLength?: number;
  onChange: (v: string | null) => void;
}) {
  return (
    <label>
      {label}
      <span className="input-row">
        <input
          type={type}
          maxLength={maxLength}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </span>
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="profile-section">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
