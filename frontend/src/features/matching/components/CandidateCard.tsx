import { useI18n, type MessageKey } from "@/i18n";
import { prefectureLabel } from "@/i18n/prefectures";
import type { PublicProfile } from "../types";

// API は体型を文字列で返すので、表示用メッセージキーに対応づける
const BODY_TYPE_KEYS: Record<string, MessageKey> = {
  slim: "options.bodyTypeShort.slim",
  average: "options.bodyTypeShort.average",
  muscular: "options.bodyTypeShort.muscular",
  plump: "options.bodyTypeShort.plump",
};

/** 候補ユーザー1人分の表示カード。 */
export function CandidateCard({ profile }: { profile: PublicProfile }) {
  const { t, lang } = useI18n();

  const meta = [
    profile.age != null ? t("candidate.age", { age: profile.age }) : null,
    profile.prefecture ? prefectureLabel(profile.prefecture, lang) : null,
    profile.occupation,
  ].filter(Boolean);

  const specs = [
    profile.height_cm != null ? `${profile.height_cm}cm` : null,
    profile.body_type && BODY_TYPE_KEYS[profile.body_type]
      ? t(BODY_TYPE_KEYS[profile.body_type])
      : null,
  ].filter(Boolean);

  return (
    <div className="candidate-card">
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="candidate-photo" />
      ) : (
        <div className="candidate-photo candidate-photo--empty">{t("common.noImage")}</div>
      )}
      <div className="candidate-body">
        <h2>{profile.display_name ?? t("common.unnamed")}</h2>
        {meta.length > 0 && (
          <p className="candidate-meta">{meta.join(t("common.metaSeparator"))}</p>
        )}
        {specs.length > 0 && <p className="candidate-specs">{specs.join(" / ")}</p>}
        {profile.bio && <p className="candidate-bio">{profile.bio}</p>}
      </div>
    </div>
  );
}
