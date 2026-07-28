import { useRef } from "react";

interface Props {
  avatarUrl: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

/** アイコン画像のプレビューと、選択/削除の操作。 */
export function AvatarUpload({ avatarUrl, onSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="avatar-upload">
      {avatarUrl ? (
        <img src={avatarUrl} alt="アイコン" className="avatar-preview" />
      ) : (
        <div className="avatar-preview avatar-placeholder">No Image</div>
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
          画像を選択
        </button>
        {avatarUrl && (
          <button type="button" className="link-btn" onClick={onRemove}>
            削除
          </button>
        )}
      </div>
    </div>
  );
}
