import { NavLink } from "react-router-dom";
import type { ProfileSummary } from "@/features/profile/hooks/useProfileSummary";
import { useI18n } from "@/i18n";

/** ナビ右上のプロフィールアイコン。押すとプロフィール設定へ。 */
export function ProfileAvatarLink({ summary }: { summary: ProfileSummary }) {
  const { t } = useI18n();
  const label = t("nav.profile");

  return (
    <NavLink
      to="/profile"
      className={({ isActive }) => `nav-avatar${isActive ? " active" : ""}`}
      title={label}
      aria-label={label}
    >
      {summary.avatarUrl ? (
        <img src={summary.avatarUrl} alt="" />
      ) : (
        // 未設定のときは頭文字（それも無ければ紋章）を出す
        <span className="nav-avatar-initial">{summary.initial || "✦"}</span>
      )}
    </NavLink>
  );
}
