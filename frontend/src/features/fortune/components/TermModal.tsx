import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import { glossaryText, type TermRef } from "../glossary";

interface Props {
  term: TermRef;
  onClose: () => void;
}

/** 用語（軸ラベル・日主など）の意味を出すポップアップ。 */
export function TermModal({ term, onClose }: Props) {
  const { t, lang } = useI18n();

  return (
    <Modal onClose={onClose} cardClassName="term-modal-card" labelledBy="term-modal-title">
      <div className="term-modal-head">
        <p className="term-modal-eyebrow">{t("glossary.heading")}</p>
        <ModalCloseButton onClose={onClose} />
      </div>

      <h2 id="term-modal-title">{term.label}</h2>
      <p className="term-modal-body">{glossaryText(term, lang)}</p>
    </Modal>
  );
}
