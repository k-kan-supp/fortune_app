# M03 都度課金の鑑定書

親: [マネタイズ設計](../../monetization.md) 視点3 ／ 関連: [M24](24-pdf-export.md) [M23](23-reading-history.md)

## ねらい

サブスクに抵抗がある層に、**1通いくら**で買い切れる鑑定書を出す。
中身は命式＋十神＋十二運＋大運の通し読みで、`narrative.py` の有料区画を
1つの読み物としてまとめたもの。購入したら永久に読める（期限を付けない）。

## 実装

**backend**

- `app/models/purchase.py` を追加。`user_id` / `product_code` / `subject_hash` /
  `amount` / `status` / `created_at`。`subject_hash` は鑑定対象の生年月日時＋性別から作る
  安定ハッシュで、**生の生年月日を購入テーブルに置かない**。マイグレーション必須。
- `app/services/billing/` に単発決済を追加。決済成功 → `purchase` 確定 → 閲覧解放の順で、
  途中で落ちても二重課金にならないよう決済側の冪等キーを使う。
- `app/api/routes/fortune.py` に `GET /api/fortune/report/{purchase_id}` を追加。
  所有者以外は 404（403 だと存在が漏れる）。
- 生成は都度計算でよい。命式計算は軽く、保存すると陳腐化する。

**frontend**

- `pages/ResultPage.tsx` に購入ボタン、`features/fortune/api/fortuneApi.ts` に取得を追加。
- 購入済みは再訪時に自動で開く。買ったことを忘れさせない。

## 検証

- `backend/tests/api/test_fortune.py`: 他人の `purchase_id` で 404。
- 決済失敗時に `purchase` が `pending` のまま残り、閲覧が解放されないこと。
- 同一ユーザー・同一対象の二重購入を抑止（既存購入があれば購入導線を出さない）。

## 完了条件

- [ ] 購入後は無期限で再閲覧できる
- [ ] 他人の鑑定書に到達できない
- [ ] 購入テーブルに生年月日が平文で入っていない
- [ ] `check.sh` 緑
