import { useRef } from "react";
import { useI18n } from "@/i18n";

interface Props {
  avatarUrl: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

/** アイコン画像のプレビューと、選択/削除の操作。 */
export function AvatarUpload({ avatarUrl, onSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  return (
    <div className="avatar-upload">
      {avatarUrl ? (
        <img src={avatarUrl} alt={t("avatar.alt")} className="avatar-preview" />
      ) : (
        <div className="avatar-preview avatar-placeholder">{t("common.noImage")}</div>
      )}

      <div className="avatar-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = ""; // 同じファイルの再選択を可能にする
          }}
        />
        <button type="button" onClick={() => inputRef.current?.click()}>
          {t("avatar.choose")}
        </button>
        {avatarUrl && (
          <button type="button" className="link-btn" onClick={onRemove}>
            {t("common.remove")}
          </button>
        )}
      </div>
    </div>
  );
}
