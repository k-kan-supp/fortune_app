import { Link } from "react-router-dom";
import { AvatarUpload } from "@/features/profile/components/AvatarUpload";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useI18n } from "@/i18n";

export function ProfilePage() {
  const { profile, loading, error, save, changeAvatar, deleteAvatar } = useProfile();
  const { t } = useI18n();

  if (loading) return <main className="container"><p>{t("common.loading")}</p></main>;
  if (!profile) return <main className="container"><p className="error">{error}</p></main>;

  return (
    <main className="container">
      <h1>{t("profile.title")}</h1>
      <p className="hint">{profile.email}</p>

      {error && <p className="error">{error}</p>}

      <AvatarUpload
        avatarUrl={profile.avatar_url}
        onSelect={changeAvatar}
        onRemove={deleteAvatar}
      />

      <ProfileForm profile={profile} onSave={save} />

      <p className="settings-links">
        <Link to="/blocked">{t("profile.blockedLink")}</Link>
      </p>

      <p className="back-link">
        <Link to="/">{t("profile.toFortune")}</Link>
      </p>
    </main>
  );
}
