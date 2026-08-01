"""WebSocket 接続の管理とメッセージ配信。

マッチ(match_id)ごとに接続を「ルーム」としてまとめ、新着メッセージを
そのルームの全接続へ配信する。プロセス内メモリで保持するため単一プロセス前提。
複数プロセス/スケール時は Redis Pub/Sub 等に置き換える（配信I/Fは同じ）。
"""

import uuid
from collections import defaultdict
from datetime import datetime
from typing import Any

from fastapi import WebSocket

from app.models.matching import Message
from app.services.chat import to_message_out
from app.services.storage.base import FileStorage


class ConnectionManager:
    def __init__(self) -> None:
        # match_id -> [(websocket, user_id), ...]
        self._rooms: dict[uuid.UUID, list[tuple[WebSocket, uuid.UUID]]] = defaultdict(list)

    async def connect(self, match_id: uuid.UUID, ws: WebSocket, user_id: uuid.UUID) -> None:
        await ws.accept()
        self._rooms[match_id].append((ws, user_id))

    def disconnect(self, match_id: uuid.UUID, ws: WebSocket) -> None:
        conns = self._rooms.get(match_id)
        if not conns:
            return
        self._rooms[match_id] = [(w, u) for (w, u) in conns if w is not ws]
        if not self._rooms[match_id]:
            self._rooms.pop(match_id, None)

    async def broadcast(
        self, match_id: uuid.UUID, message: Message, storage: FileStorage
    ) -> None:
        """新着メッセージをルームの全接続へ送る（is_mine は受信者ごとに算出）。"""
        for ws, uid in list(self._rooms.get(match_id, [])):
            payload = to_message_out(message, uid, storage).model_dump(mode="json")
            await self._safe_send(match_id, ws, {"type": "message", "message": payload})

    async def notify_typing(
        self, match_id: uuid.UUID, sender_id: uuid.UUID, is_typing: bool
    ) -> None:
        """「入力中」を送信者以外の接続へ通知する（永続化しない一時イベント）。"""
        event = {"type": "typing", "user_id": str(sender_id), "is_typing": is_typing}
        for ws, uid in list(self._rooms.get(match_id, [])):
            if uid != sender_id:
                await self._safe_send(match_id, ws, event)

    async def notify_read(
        self, match_id: uuid.UUID, reader_id: uuid.UUID, read_at: datetime
    ) -> None:
        """既読を送信者側（reader 以外）へ通知し、相手の「既読」表示を更新させる。"""
        event = {"type": "read", "user_id": str(reader_id), "read_at": read_at.isoformat()}
        for ws, uid in list(self._rooms.get(match_id, [])):
            if uid != reader_id:
                await self._safe_send(match_id, ws, event)

    async def _safe_send(self, match_id: uuid.UUID, ws: WebSocket, data: dict[str, Any]) -> None:
        try:
            await ws.send_json(data)
        except Exception:  # 切断済み等は掃除して継続
            self.disconnect(match_id, ws)


manager = ConnectionManager()
