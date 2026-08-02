# M11 蔵干・十二運の詳細

親: [マネタイズ設計](../../monetization.md) 視点11 ／ 関連: [M01](01-free-paid-line.md) [M12](12-ten-gods-practical.md)

## ねらい

蔵干（`hidden_stems`）と十二運星（`twelve_stages.py`）は既に計算済みで表に出ている。
売るのは計算結果ではなく**読み方**。「日支の蔵干が本気を隠す」のような、
表を見ただけでは絶対に出てこない解釈文を有料区画に載せる。追加の計算はほぼ不要で、
[M01](01-free-paid-line.md) が通っていれば最も低コストで出せる有料商品。

## 実装

**backend**

- `app/services/saju/narrative.py` に `hidden_stems_blocks()` と `twelve_stages_blocks()` を追加。
  返すのは `body_code` のみ。文言は持たない（[architecture.md](../../architecture.md)）。
- コードの体系を先に決める。`hs.<干支>.<蔵干>.<位置>` のように**組み合わせで一意**にする。
  ここを場当たりに振ると、後で文言を差し替えるときに全部書き直しになる。
- 蔵干は本気・中気・余気で意味が変わるので、位置をコードに含める。
  十二運は12段階×4柱で48通り。全部書くのではなく、日柱・月柱に絞って始める。

**frontend**

- `features/fortune/components/MeishikiTable.tsx` の各セルから該当解説へ飛ばす。
  既存の `TermModal.tsx` を再利用し、新しいモーダルを作らない。
- 文言は `i18n/messages/{ja,en}.ts` に同時追加。件数が多いので、
  キーの命名規則をファイル冒頭にコメントで固定してから書き始める。

## 検証

- `backend/tests/services/test_narrative.py`: 全ての干支・蔵干の組み合わせでコードが引けること
  （欠けがあると本番で空欄になる）。
- ja/en のキー差分が無いことをテストで検出する。

## 完了条件

- [ ] コード体系が命名規則として明文化されている
- [ ] 未定義のコードが1つも生成されない
- [ ] ja/en のキーが一致
- [ ] `check.sh` 緑
