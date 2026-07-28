import type { PublicProfile } from "../types";

const BODY_TYPE_LABELS: Record<string, string> = {
  slim: "細身",
  average: "普通",
  muscular: "筋肉質",
  plump: "ぽっちゃり",
};

/** 候補ユーザー1人分の表示カード。 */
export function CandidateCard({ profile }: { profile: PublicProfile }) {
  const meta = [
    profile.age != null ? `${profile.age}歳` : null,
    profile.prefecture,
    profile.occupation,
  ].filter(Boolean);

  const specs = [
    profile.height_cm != null ? `${profile.height_cm}cm` : null,
    profile.body_type ? BODY_TYPE_LABELS[profile.body_type] : null,
  ].filter(Boolean);

  return (
    <div className="candidate-card">
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="candidate-photo" />
      ) : (
        <div className="candidate-photo candidate-photo--empty">No Image</div>
      )}
      <div className="candidate-body">
        <h2>{profile.display_name ?? "名称未設定"}</h2>
        {meta.length > 0 && <p className="candidate-meta">{meta.join("・")}</p>}
        {specs.length > 0 && <p className="candidate-specs">{specs.join(" / ")}</p>}
        {profile.bio && <p className="candidate-bio">{profile.bio}</p>}
      </div>
    </div>
  );
}
