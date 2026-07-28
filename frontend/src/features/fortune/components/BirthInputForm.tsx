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

/** 生年月日時の入力フォーム。設問を 1 ブロックずつ縦に並べる。 */
export function BirthInputForm({ onSubmit, loading, initial }: Props) {
  const [form, setForm] = useState<FortuneRequest>({ ...DEFAULTS, ...initial });

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
        <h2 className="q-title">生まれた年・月・日を教えてください。</h2>
        <p className="q-note">西暦で入力してください。命式はこの日付から組み立てます。</p>
        <div className="q-fields">
          <label className="q-field">
            年
            <input
              type="number"
              value={form.year}
              onChange={(e) => update("year", Number(e.target.value))}
            />
          </label>
          <label className="q-field">
            月
            <input
              type="number"
              value={form.month}
              onChange={(e) => update("month", Number(e.target.value))}
            />
          </label>
          <label className="q-field">
            日
            <input
              type="number"
              value={form.day}
              onChange={(e) => update("day", Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="q-block">
        <h2 className="q-title">生まれた時刻はわかりますか。</h2>
        <p className="q-note">時柱に使います。わからない場合は 12 時のままで構いません。</p>
        <div className="q-fields">
          <label className="q-field">
            時
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
          {loading ? "鑑定中…" : "鑑定する"}
        </button>
      </div>
    </form>
  );
}
