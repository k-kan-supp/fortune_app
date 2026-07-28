import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { BirthInputForm } from "@/features/fortune/components/BirthInputForm";
import { MeishikiTable } from "@/features/fortune/components/MeishikiTable";
import { profileToFortuneDefaults } from "@/features/fortune/fromProfile";
import { useFortune } from "@/features/fortune/hooks/useFortune";
import type { FortuneRequest } from "@/features/fortune/types";
import { getProfile } from "@/features/profile/api/profileApi";

const STEPS = [
  {
    n: 1,
    mark: "暦",
    title: "生年月日を入力",
    body: "生まれた年月日と時刻を入れるだけ。登録なしですぐに鑑定できます。",
  },
  {
    n: 2,
    mark: "盤",
    title: "命式を読み解く",
    body: "四つの柱に並ぶ天干・地支・蔵干から、生まれ持った性質を確かめましょう。",
  },
  {
    n: 3,
    mark: "縁",
    title: "縁のある人と出会う",
    body: "プロフィールに生年月日を保存すると、相性の良い相手をさがせます。",
  },
];

export function FortunePage() {
  const { result, loading, error, submit } = useFortune();
  const [defaults, setDefaults] = useState<Partial<FortuneRequest>>();
  const [prefilled, setPrefilled] = useState(false);
  const loggedIn = isAuthenticated();

  // ログイン済みならプロフィールの生年月日を初期値に反映する
  useEffect(() => {
    if (!loggedIn) return;
    getProfile()
      .then((p) => {
        const d = profileToFortuneDefaults(p);
        if (Object.keys(d).length > 0) {
          setDefaults(d);
          setPrefilled(true);
        }
      })
      .catch(() => {
        /* 未ログイン・未設定は無視（手入力で使える） */
      });
  }, [loggedIn]);

  return (
    <main>
      <section className="hero">
        <div className="hero-mark">✦</div>
        <h1 className="hero-title">無料 四柱推命 鑑定</h1>
        <p className="hero-sub">生年月日から、生まれ持った四つの柱を読み解きます。</p>
      </section>

      <div className="wrap-wide">
        <div className="step-cards">
          {STEPS.map((s) => (
            <article key={s.n} className={`step-card step-card--${s.n}`}>
              <div className="step-art">{s.mark}</div>
              <span className="step-badge">ステップ {s.n}</span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </article>
          ))}
        </div>

        {prefilled && (
          <p className="hint prefill-note">
            プロフィールの生年月日を反映しました。<Link to="/profile">編集する</Link>
          </p>
        )}

        <BirthInputForm initial={defaults} onSubmit={submit} loading={loading} />
        {error && <p className="error">{error}</p>}

        {result && (
          <section className="result-section">
            <div className="result-head">
              <h2>あなたの命式</h2>
              <p className="hint">日主を中心に、四柱の干支と蔵干を並べています。</p>
            </div>
            <MeishikiTable result={result} />
          </section>
        )}

        <p className="back-link">
          {loggedIn ? (
            <Link to="/profile">プロフィール設定 →</Link>
          ) : (
            <Link to="/register">ユーザー登録して生年月日を保存 →</Link>
          )}
        </p>
      </div>
    </main>
  );
}
