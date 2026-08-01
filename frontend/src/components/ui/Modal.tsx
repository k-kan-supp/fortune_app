import { useEffect, useRef, type ReactNode } from "react";
import { useI18n } from "@/i18n";

interface Props {
  onClose: () => void;
  /** ダイアログ本体のクラス。幅や余白は用途ごとに変えるので呼び出し側で指定する。 */
  cardClassName: string;
  /** 見出し要素の id（読み上げ用）。 */
  labelledBy?: string;
  /** 見出し要素が無いときの読み上げ名。 */
  label?: string;
  /** 送信中など、閉じさせたくない間は false にする。 */
  closable?: boolean;
  children: ReactNode;
}

/**
 * 画面全体を覆うポップアップの土台。
 * 背景クリック・Esc で閉じ、ダイアログの読み上げ属性を付ける。
 * 中身（見出し・本文・操作）は呼び出し側が組み立てる。
 */
export function Modal({
  onClose,
  cardClassName,
  labelledBy,
  label,
  closable = true,
  children,
}: Props) {
  // 呼び出し側は毎レンダー新しい関数を渡してくるので、ref 経由で参照して
  // keydown の登録は開いている間 1 回だけにする
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!closable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closable]);

  return (
    <div className="modal-backdrop" onClick={() => closable && onClose()}>
      <div
        className={cardClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/** ポップアップ右上の閉じるボタン。 */
export function ModalCloseButton({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="modal-close"
      aria-label={t("common.close")}
      onClick={onClose}
    >
      ✕
    </button>
  );
}
