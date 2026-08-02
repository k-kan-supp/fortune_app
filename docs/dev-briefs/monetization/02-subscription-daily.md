# M02 毎日の運勢サブスク

親: [マネタイズ設計](../../monetization.md) 視点2 ／ 関連: [M23](23-reading-history.md) [G26](../growth/26-push-timing.md)

## ねらい

`services/saju/daily.py` が返す日次の読み（四領域＋星）を月額の中心商品にする。
単発鑑定は一度きりだが、日次は**毎朝アプリを開く理由**になり、LTV と継続率を直接押し上げる。
無料層には当日分の要約1行のみ、加入者には四領域の全文と翌日以降を出す。

## 実装

**backend**

- `app/models/` に `subscription.py` を追加。
  `user_id` / `plan`（`daily` / `full`）/ `status`（`active` `past_due` `canceled`）/
  `current_period_end` / `provider_ref` を持たせる。`alembic revision` を必ず添える。
- `app/services/billing/` を新設し、決済プロバイダとの通信をここに閉じる。
  webhook で `status` と `current_period_end` を更新する。webhook は冪等にする
  （同じイベント ID を二度処理しても状態が壊れないこと）。
- `app/api/deps.py` に `require_active_subscription(plan)` を追加し、
  ルート側で使う。`daily.py` 本体は課金を知らないままにする。
- `/api/fortune/daily` を無料要約と全文で出し分ける。

**frontend**

- `features/fortune/components/DailyFortune.tsx` を「要約＋ロックされた四領域」表示に。
- 加入導線は `components/ui/Modal.tsx` を再利用したプラン選択に寄せる。
- 文言は ja/en 同時追加。

## 検証

- `backend/tests/services/test_daily.py`: 出し分けの境界（期限当日・期限切れ翌日）。
- `backend/tests/api/`: `past_due` で全文が返らないこと。
- 同一 webhook イベントの二重配信テスト。

## 完了条件

- [ ] 解約後、期間末までは閲覧でき、翌日から止まる
- [ ] webhook 二重配信で課金状態が壊れない
- [ ] マイグレーション追加済み
- [ ] `check.sh` 緑
