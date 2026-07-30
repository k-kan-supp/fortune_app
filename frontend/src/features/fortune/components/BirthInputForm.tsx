import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n";
import type { FortuneRequest } from "../types";

interface Props {
  onSubmit: (req: FortuneRequest) => void;
  loading: boolean;
  /** プロフィール等から渡す初期値（非同期に届くため後から反映する）。 */
  initial?: Partial<FortuneRequest>;
}

const DEFAULTS: FortuneRequest = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  is_male: true,
};

/** 生年月日時の入力フォーム。設問を 1 ブロックずつ縦に並べる。 */
export function BirthInputForm({ onSubmit, loading, initial }: Props) {
  const [form, setForm] = useState<FortuneRequest>({ ...DEFAULTS, ...initial });
  const { t } = useI18n();

  // initial は非同期（プロフィール取得後）に届くので、届いたら反映する
  useEffect(() => {
    if (initial) setForm((prev) => ({ ...prev, ...initial }));
  }, [initial]);

  function update<K extends keyof FortuneRequest>(key: K, value: FortuneRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); onSubmit(form); }} className="q-list">
      <section className="q-block">
        <h2 className="q-title">{t("fortune.form.dateTitle")}</h2>
        <p className="q-note">{t("fortune.form.dateNote")}</p>
        <div className="q-fields">
          <label className="q-field">
            {t("fortune.form.year")}
            <input
              type="number"
              value={form.year}
              onChange={(e) => update("year", Number(e.target.value))}
            />
          </label>
          <label className="q-field">
            {t("fortune.form.month")}
            <input
              type="number"
              value={form.month}
              onChange={(e) => update("month", Number(e.target.value))}
            />
          </label>
          <label className="q-field">
            {t("fortune.form.day")}
            <input
              type="number"
              value={form.day}
              onChange={(e) => update("day", Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="q-block">
        <h2 className="q-title">{t("fortune.form.timeTitle")}</h2>
        <p className="q-note">{t("fortune.form.timeNote")}</p>
        <div className="q-fields">
          <label className="q-field">
            {t("fortune.form.hour")}
            <input
              type="number"
              value={form.hour}
              onChange={(e) => update("hour", Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <div className="q-actions">
        <button type="submit" className="q-submit" disabled={loading}>
          {loading ? t("fortune.form.submitting") : t("fortune.form.submit")}
        </button>
      </div>
    </form>
  );
}
