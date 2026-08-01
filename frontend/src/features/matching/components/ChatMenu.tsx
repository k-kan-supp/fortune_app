import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { useI18n, type MessageKey } from "@/i18n";
import { blockInMatch, reportInMatch } from "../api/matchingApi";

/** 通報理由の選択肢（値はキー、表示は言語ごとの文言）。 */
const REPORT_REASONS: { key: string; labelKey: MessageKey }[] = [
  { key: "inappropriate", labelKey: "chatMenu.reasons.inappropriate" },
  { key: "impersonation", labelKey: "chatMenu.reasons.impersonation" },
  { key: "photoMismatch", labelKey: "chatMenu.reasons.photoMismatch" },
  { key: "other", labelKey: "chatMenu.reasons.other" },
];

/** チャット画面の右上メニュー（ブロック / 通報）。 */
export function ChatMenu({ matchId }: { matchId: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reasonKey, setReasonKey] = useState(REPORT_REASONS[0].key);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  function reasonLabel(key: string): string {
    const found = REPORT_REASONS.find((r) => r.key === key);
    return found ? t(found.labelKey) : key;
  }

  async function handleBlock() {
    if (!window.confirm(t("chatMenu.blockConfirm"))) {
      return;
    }
    setBusy(true);
    try {
      await blockInMatch(matchId);
      navigate("/matches", { replace: true });
    } catch {
      alert(t("chatMenu.blockFailed"));
      setBusy(false);
    }
  }

  async function submitReport() {
    setBusy(true);
    try {
      const label = reasonLabel(reasonKey);
      const text = reasonKey === "other" ? detail : `${label}${detail ? `: ${detail}` : ""}`;
      await reportInMatch(matchId, text);
      setReporting(false);
      alert(t("chatMenu.reportThanks"));
    } catch {
      alert(t("chatMenu.reportFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-menu">
      <button
        className="menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("chatMenu.menu")}
      >
        ⋮
      </button>

      {open && (
        <div className="menu-popover" onMouseLeave={() => setOpen(false)}>
          <button onClick={() => { setOpen(false); setReporting(true); }}>
            {t("chatMenu.report")}
          </button>
          <button className="danger" disabled={busy} onClick={handleBlock}>
            {t("chatMenu.block")}
          </button>
        </div>
      )}

      {reporting && (
        <Modal
          onClose={() => setReporting(false)}
          cardClassName="match-modal-card report-card"
          labelledBy="report-modal-title"
          closable={!busy}
        >
          <h2 id="report-modal-title">{t("chatMenu.reportTitle")}</h2>
          <label>
            {t("chatMenu.reason")}
            <select value={reasonKey} onChange={(e) => setReasonKey(e.target.value)}>
              {REPORT_REASONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <textarea
            rows={3}
            placeholder={t("chatMenu.detail")}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
          <div className="filter-actions">
            <button className="pass-btn" disabled={busy} onClick={() => setReporting(false)}>
              {t("common.cancel")}
            </button>
            <button className="like-btn" disabled={busy} onClick={submitReport}>
              {t("common.send")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
