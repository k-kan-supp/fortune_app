import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blockInMatch, reportInMatch } from "../api/matchingApi";

const REPORT_REASONS = [
  "不適切なメッセージ",
  "なりすまし・業者の疑い",
  "写真と本人が違う",
  "その他",
];

/** チャット画面の右上メニュー（ブロック / 通報）。 */
export function ChatMenu({ matchId }: { matchId: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleBlock() {
    if (!window.confirm("このユーザーをブロックしますか？ マッチとチャットは表示されなくなります。")) {
      return;
    }
    setBusy(true);
    try {
      await blockInMatch(matchId);
      navigate("/matches", { replace: true });
    } catch {
      alert("ブロックに失敗しました。");
      setBusy(false);
    }
  }

  async function submitReport() {
    setBusy(true);
    try {
      const text = reason === "その他" ? detail : `${reason}${detail ? `: ${detail}` : ""}`;
      await reportInMatch(matchId, text);
      setReporting(false);
      alert("通報を受け付けました。ご協力ありがとうございます。");
    } catch {
      alert("通報に失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-menu">
      <button className="menu-trigger" onClick={() => setOpen((v) => !v)} aria-label="メニュー">
        ⋮
      </button>

      {open && (
        <div className="menu-popover" onMouseLeave={() => setOpen(false)}>
          <button onClick={() => { setOpen(false); setReporting(true); }}>通報する</button>
          <button className="danger" disabled={busy} onClick={handleBlock}>
            ブロックする
          </button>
        </div>
      )}

      {reporting && (
        <div className="match-modal" onClick={() => !busy && setReporting(false)}>
          <div className="match-modal-card report-card" onClick={(e) => e.stopPropagation()}>
            <h2>通報</h2>
            <label>
              理由
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              rows={3}
              placeholder="詳細（任意）"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
            <div className="filter-actions">
              <button className="pass-btn" disabled={busy} onClick={() => setReporting(false)}>
                キャンセル
              </button>
              <button className="like-btn" disabled={busy} onClick={submitReport}>
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
