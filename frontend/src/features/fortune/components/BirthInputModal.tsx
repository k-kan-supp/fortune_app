import type { ReactNode } from "react";
import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import type { FortuneRequest } from "../types";
import { BirthInputForm } from "./BirthInputForm";

interface Props {
  onClose: () => void;
  onSubmit: (req: FortuneRequest) => void;
  initial?: Partial<FortuneRequest>;
  /** プロフィールからの初期値反映など、フォーム上部に出す補足。 */
  note?: ReactNode;
}

/** 生年月日時の入力フォームをポップアップで表示する。 */
export function BirthInputModal({ onClose, onSubmit, initial, note }: Props) {
  const { t } = useI18n();

  return (
    <Modal onClose={onClose} cardClassName="birth-modal-card" labelledBy="birth-modal-title">
      <div className="birth-modal-head">
        <h2 id="birth-modal-title">{t("fortune.modalTitle")}</h2>
        <ModalCloseButton onClose={onClose} />
      </div>

      {note}
      <BirthInputForm initial={initial} onSubmit={onSubmit} />
    </Modal>
  );
}
