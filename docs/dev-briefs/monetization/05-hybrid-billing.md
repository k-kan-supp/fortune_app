# M05 月額＋都度のハイブリッド

親: [マネタイズ設計](../../monetization.md) 視点5 ／ 関連: [M02](02-subscription-daily.md) [M04](04-ticket-credits.md)

## ねらい

月額（[M02](02-subscription-daily.md)）とチケット（[M04](04-ticket-credits.md)）を併存させ、
加入者には毎月チケットを自動付与する。月額の体感価値が上がり、
かつ使い切った加入者が追加購入するので、単価の天井が消える。

## 実装

**backend**

- 権限判定を1か所に集約する。`app/services/billing/entitlement.py` に
  `can_access(user, feature) -> Access` を置き、`Access` は
  `allowed`（月額で開放済み）/ `payable`（チケットで購入可）/ `denied` を返す。
  ルートやフロントで `if subscription or credits` を書き散らさない。**これが本題**。
- 月次付与は `current_period_end` 更新の webhook 契機で `grant()`。
  cron ではなく課金イベントに紐づけると、支払い失敗時に付与されない挙動が自然に得られる。
- 付与分に有効期限（当月内）を持たせるか否かを `reason` で区別できるようにしておく。

**frontend**

- 各有料面は `Access` をそのまま受け取り、3状態を出し分ける。
  `allowed` は素通し、`payable` は「チケット1枚で開く」、`denied` はプラン案内。
- ja/en 同時。

## 検証

- `entitlement` の単体テストを状態の全組み合わせで書く
  （非加入×残高0/有り、加入×残高0/有り、`past_due`×残高有り）。
- 月額で開放されている面ではチケットが**消費されない**こと。ここは苦情に直結する。

## 完了条件

- [ ] 権限判定が `entitlement.py` の外に存在しない
- [ ] 月額加入中にチケットが減らない
- [ ] 全状態組み合わせのテストがある
- [ ] `check.sh` 緑
