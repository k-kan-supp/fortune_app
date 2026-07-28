import { Link } from "react-router-dom";
import { AvatarUpload } from "@/features/profile/components/AvatarUpload";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { useProfile } from "@/features/profile/hooks/useProfile";

export function ProfilePage() {
  const { profile, loading, error, save, changeAvatar, deleteAvatar } = useProfile();

  if (loading) return <main className="container"><p>読み込み中…</p></main>;
  if (!profile) return <main className="container"><p className="error">{error}</p></main>;

  return (
    <main className="container">
      <h1>プロフィール設定</h1>
      <p className="hint">{profile.email}</p>

      {error && <p className="error">{error}</p>}

      <AvatarUpload
        avatarUrl={profile.avatar_url}
        onSelect={changeAvatar}
        onRemove={deleteAvatar}
      />

      <ProfileForm profile={profile} onSave={save} />

      <p className="back-link">
        <Link to="/">← 四柱推命を鑑定する</Link>
      </p>
    </main>
  );
}
