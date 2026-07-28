import { useEffect, useRef, useState } from "react";
import { getToken } from "@/features/auth/authStorage";
import { getMessages, markRead } from "../api/matchingApi";
import type { Message } from "../types";

function wsUrl(matchId: string, token: string): string {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/api/matching/matches/${matchId}/ws?token=${token}`;
}

/**
 * マッチ内チャット。
 * 初期履歴は REST で取得し、以降の送受信は WebSocket でリアルタイムに行う。
 */
export function useChat(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;
    const token = getToken();

    // 1) 初期履歴（取得時にサーバ側で既読化される）
    getMessages(matchId)
      .then((m) => active && setMessages(m))
      .catch((e) => active && setError(e instanceof Error ? e.message : "取得に失敗しました。"));

    // 2) WebSocket 接続
    if (!token) return;
    const ws = new WebSocket(wsUrl(matchId, token));
    socketRef.current = ws;

    ws.onopen = () => active && setConnected(true);
    ws.onclose = () => active && setConnected(false);
    ws.onerror = () => active && setError("接続エラーが発生しました。");
    ws.onmessage = (ev) => {
      if (!active) return;
      const msg = JSON.parse(ev.data) as Message;
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]));
      // 相手からの新着は、表示中なので即既読にする（ナビの未読バッジ用）
      if (!msg.is_mine) markRead(matchId).catch(() => {});
    };

    return () => {
      active = false;
      ws.close();
      socketRef.current = null;
    };
  }, [matchId]);

  function send(body: string) {
    const text = body.trim();
    if (!text) return;
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError("接続していません。少し待って再試行してください。");
      return;
    }
    // 送信分はサーバからの配信（echo）で反映されるため、ここでは追加しない
    ws.send(JSON.stringify({ body: text }));
  }

  return { messages, error, connected, send };
}
