import { useEffect, useRef, useState } from "react";
import { getToken } from "@/features/auth/authStorage";
import { getLang, translate, useI18n } from "@/i18n";
import { getMessages, markRead } from "../api/matchingApi";
import type { Message } from "../types";

function wsUrl(matchId: string, token: string): string {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/api/matching/matches/${matchId}/ws?token=${token}`;
}

// サーバから届くイベントの型
type ServerEvent =
  | { type: "message"; message: Message }
  | { type: "typing"; user_id: string; is_typing: boolean }
  | { type: "read"; user_id: string; read_at: string };

const TYPING_TIMEOUT_MS = 4000;

/**
 * マッチ内チャット。
 * 初期履歴は REST で取得し、以降の送受信・入力中通知は WebSocket で行う。
 */
export function useChat(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const typingOffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    let active = true;
    const token = getToken();

    // 1) 初期履歴（取得時にサーバ側で既読化される）
    getMessages(matchId)
      .then((m) => active && setMessages(m))
      .catch(
        (e) =>
          active &&
          setError(e instanceof Error ? e.message : translate(getLang(), "errors.fetch")),
      );

    // 2) WebSocket 接続
    if (!token) return;
    const ws = new WebSocket(wsUrl(matchId, token));
    socketRef.current = ws;

    ws.onopen = () => active && setConnected(true);
    ws.onclose = () => active && setConnected(false);
    ws.onerror = () =>
      active && setError(translate(getLang(), "chat.connectionError"));
    ws.onmessage = (ev) => {
      if (!active) return;
      const data = JSON.parse(ev.data) as ServerEvent;

      if (data.type === "typing") {
        setOthersTyping(data.is_typing);
        // 相手の keepalive が途切れても数秒で自動的に消す
        if (typingOffTimer.current) clearTimeout(typingOffTimer.current);
        if (data.is_typing) {
          typingOffTimer.current = setTimeout(() => setOthersTyping(false), TYPING_TIMEOUT_MS);
        }
        return;
      }

      if (data.type === "read") {
        // 相手が読んだ時刻以前の自分のメッセージを「既読」にする
        const readTime = new Date(data.read_at).getTime();
        setMessages((prev) =>
          prev.map((m) =>
            m.is_mine && !m.read && new Date(m.created_at).getTime() <= readTime
              ? { ...m, read: true }
              : m,
          ),
        );
        return;
      }

      const msg = data.message;
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]));
      setOthersTyping(false); // メッセージ着信で「入力中」は解除
      if (!msg.is_mine) markRead(matchId).catch(() => {});
    };

    return () => {
      active = false;
      if (typingOffTimer.current) clearTimeout(typingOffTimer.current);
      ws.close();
      socketRef.current = null;
    };
  }, [matchId]);

  function sendEvent(payload: object) {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }

  function send(body: string) {
    const text = body.trim();
    if (!text) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError(t("chat.notConnected"));
      return;
    }
    // 送信分はサーバからの配信（echo）で反映されるため、ここでは追加しない
    sendEvent({ type: "message", body: text });
  }

  function setTyping(isTyping: boolean) {
    sendEvent({ type: "typing", is_typing: isTyping });
  }

  return { messages, error, connected, othersTyping, send, setTyping };
}
