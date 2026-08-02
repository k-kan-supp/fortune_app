# M01 無料/有料の線引き

親: [マネタイズ設計](../../monetization.md) 視点1 ／ 関連: [M29](29-paywall-placement.md) [G01](../growth/01-seo-free-tool.md)

## ねらい

命式（四柱・十神・十二運・蔵干の表）は完全無料で出し切り、
「その配置が自分にとって何を意味するか」＝解釈文だけを有料にする。
命式を囲うと G01–G06 の検索流入が成立しないので、この線は今後動かさない前提で設計する。

## 境界

この指示書は**機能単位**の線引き（命式・日次・相性・テーマ別のどれが無料か）を決める。
有料区画のうち**どこまでを予告として見せるか**は [M29](29-paywall-placement.md)。
両方がブロック列の切断位置を書き換えると、設定が二重になって効かなくなる。

## 実装

**backend**

- `app/services/saju/narrative.py` の生成結果を `free` / `paid` の2区画に分ける。
  返却は文言ではなく `NarrativeBlock(section, tier, body_code)` のリストにし、
  表示名の解決はフロントに残す（[architecture.md](../../architecture.md) の方針どおり）。
- `app/schemas/fortune.py` の `FortuneResponse` に `narrative: list[NarrativeBlock]` を追加。
  未課金ユーザーにも `tier="paid"` の要素を**返す**が、`body_code=None` / `locked=True` にする。
  何が隠れているかが見えないと課金動機が生まれない。
- 課金判定は `app/api/routes/fortune.py` で `deps.py` の現在ユーザーから行う。
  service 層に課金概念を持ち込まない（純ロジックのまま保つ）。

**frontend**

- `features/fortune/components/ResultSummary.tsx` で `locked` ブロックを
  見出しのみ表示＋本文をぼかす。命式表 `MeishikiTable.tsx` は一切ロックしない。
- 文言キーは `i18n/messages/ja.ts` と `en.ts` に同時追加。

## 検証

- `backend/tests/services/test_narrative.py`: 全ブロックに tier が付くこと。
- `backend/tests/api/test_fortune.py`: **未認証レスポンスに有料本文が1文字も含まれない**こと。
  これが最重要で、ここが漏れると課金設計全体が無意味になる。
- `./scripts/check.sh`

## 完了条件

- [ ] 未課金レスポンスの JSON に有料本文が含まれない
- [ ] 無料区画だけで命式表が完成し、単体で読み物として成立する
- [ ] ja/en のキー構造が一致している
- [ ] `check.sh` 緑
