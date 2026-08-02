# M15 相手ごとの詳細相性

親: [マネタイズ設計](../../monetization.md) 視点15 ／ 関連: [G21](../growth/21-partner-birthdate-invite.md) [M31](31-per-target-billing.md)

## ねらい

**このプロダクトで最も重要な有料機能**。相性は相手の生年月日を必要とするため、
課金（[M31](31-per-target-billing.md)）と拡散（[G21](../growth/21-partner-birthdate-invite.md)）が
同じ導線に乗る唯一の面。ここの体験の質がプロダクト全体の上限を決める。

`compatibility.py` / `species_compat.py` は既にスコアを返している。
売るのは**点数ではなく理由と対処法**。「相性72点」で終わらせない。

## 実装

**backend**

- `app/services/saju/compatibility.py` に `detail(a, b)` を追加し、
  スコアの内訳（日支の関係、五行の補完、十神の噛み合い）を構造化して返す。
  総合点だけ返す現状の API は**変えない**（無料層の表示に使う）。
- 「良い/悪い」ではなく「こう噛み合い、こうズレる」の対で出す。
  低スコアのペアに救いが無いと課金体験として成立しない。
- 対処法は行動レベルで書く（「連絡頻度を相手に合わせる」など）。

**frontend**

- `features/matching/components/CompatibilityModal.tsx` を無料の要約＋有料の詳細に分ける。
- `CompareRadar.tsx` は無料のまま残す。図は引きとして機能する。
- ja/en 同時。

## 検証

- **`backend/tests/services/test_compatibility.py` の期待値を必ず追従させる**
  （CLAUDE.md の規約。スコアリングを触ったのにテストが緑なら、テストが足りていない）。
- 自分自身との相性、同一生年月日、極端に低いスコアの3ケースを明示的にテストする。

## 完了条件

- [ ] 既存の総合点 API の出力が変わっていない
- [ ] 低スコアでも対処法が出る
- [ ] `test_compatibility.py` が更新されている
- [ ] `check.sh` 緑
