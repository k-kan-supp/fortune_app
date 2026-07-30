import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import type { FortuneRequest } from "../types";
import { BirthInputForm } from "./BirthInputForm";

interface Props {
  onClose: () => void;
  onSubmit: (req: FortuneRequest) => void;
  loading: boolean;
  initial?: Partial<FortuneRequest>;
  error?: string | null;
  /** プロフィールからの初期値反映など、フォーム上部に出す補足。 */
  note?: ReactNode;
}

/** 生年月日時の入力フォームをポップアップで表示する。 */
export function BirthInputModal({
  onClose,
  onSubmit,
  loading,
  initial,
  error,
  note,
}: Props) {
  const { t } = useI18n();

  // Esc でも閉じられるようにする
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="birth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="birth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="birth-modal-head">
          <h2 id="birth-modal-title">{t("fortune.modalTitle")}</h2>
          <button
            type="button"
            className="modal-close"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {note}
        <BirthInputForm initial={initial} onSubmit={onSubmit} loading={loading} />
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
