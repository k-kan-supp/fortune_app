import { useEffect, useState, type FormEvent } from "react";
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

/** 生年月日時・性別の入力フォーム。 */
export function BirthInputForm({ onSubmit, loading, initial }: Props) {
  const [form, setForm] = useState<FortuneRequest>({ ...DEFAULTS, ...initial });

  // initial は非同期（プロフィール取得後）に届くので、届いたら反映する
  useEffect(() => {
    if (initial) setForm((prev) => ({ ...prev, ...initial }));
  }, [initial]);

  function update<K extends keyof FortuneRequest>(key: K, value: FortuneRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="birth-form">
      <label>
        年
        <input
          type="number"
          value={form.year}
          onChange={(e) => update("year", Number(e.target.value))}
        />
      </label>
      <label>
        月
        <input
          type="number"
          value={form.month}
          onChange={(e) => update("month", Number(e.target.value))}
        />
      </label>
      <label>
        日
        <input
          type="number"
          value={form.day}
          onChange={(e) => update("day", Number(e.target.value))}
        />
      </label>
      <label>
        時
        <input
          type="number"
          value={form.hour}
          onChange={(e) => update("hour", Number(e.target.value))}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "鑑定中…" : "鑑定する"}
      </button>
    </form>
  );
}
