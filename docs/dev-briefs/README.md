# 開発指示書インデックス（100本）

[monetization.md](../monetization.md) と [growth.md](../growth.md) の各視点を、
そのまま着手できる粒度の指示書に落としたもの。1本 ≒ 1 PR を想定している。

共通の前提:

- 占術ロジックは `backend/app/services/saju/` に集約。フロントで再計算しない。
- 表示文言は `frontend/src/i18n/messages/{ja,en}.ts` を**必ず同時に**更新する。
  サーバ発の文言は `backend/app/core/i18n.py` の `MESSAGES`。
- mypy は strict。型スタブの無い依存は `pyproject.toml` の `[[tool.mypy.overrides]]` へ。
- DB スキーマを変えたら `alembic revision` を必ず添える。
- 完了判定は `./scripts/check.sh` が緑であること。

## マネタイズ（M01–M50）

### 課金の形
| # | 指示書 |
| --- | --- |
| M01 | [無料/有料の線引き](monetization/01-free-paid-line.md) |
| M02 | [毎日の運勢サブスク](monetization/02-subscription-daily.md) |
| M03 | [都度課金の鑑定書](monetization/03-one-off-report.md) |
| M04 | [チケット従量](monetization/04-ticket-credits.md) |
| M05 | [月額＋都度ハイブリッド](monetization/05-hybrid-billing.md) |
| M06 | [初回無料枠](monetization/06-first-free.md) |
| M07 | [7日トライアル](monetization/07-trial-7day.md) |
| M08 | [年額プラン](monetization/08-annual-plan.md) |
| M09 | [ペア割](monetization/09-pair-plan.md) |
| M10 | [学割](monetization/10-student-plan.md) |

### 何を有料にするか
| # | 指示書 |
| --- | --- |
| M11 | [蔵干・十二運の詳細](monetization/11-hidden-stems-detail.md) |
| M12 | [十神の実践解釈](monetization/12-ten-gods-practical.md) |
| M13 | [大運・年運](monetization/13-luck-cycles.md) |
| M14 | [開運日カレンダー](monetization/14-lucky-day-calendar.md) |
| M15 | [相手ごとの詳細相性](monetization/15-pair-compatibility-detail.md) |
| M16 | [適職・転職鑑定](monetization/16-career-reading.md) |
| M17 | [金運鑑定](monetization/17-wealth-reading.md) |
| M18 | [健康鑑定](monetization/18-health-reading.md) |
| M19 | [方位・引越](monetization/19-direction-reading.md) |
| M20 | [命名](monetization/20-naming-reading.md) |
| M21 | [家族・親子相性](monetization/21-family-compatibility.md) |
| M22 | [レーダー10枚の読み解き](monetization/22-radar-interpretation.md) |
| M23 | [鑑定履歴の保存](monetization/23-reading-history.md) |
| M24 | [PDF 出力](monetization/24-pdf-export.md) |
| M25 | [製本・印刷](monetization/25-print-fulfillment.md) |

### 価格と提示
| # | 指示書 |
| --- | --- |
| M26 | [3段価格](monetization/26-three-tier-pricing.md) |
| M27 | [松竹梅（中央誘導）](monetization/27-decoy-plan.md) |
| M28 | [アンカー価格](monetization/28-price-anchoring.md) |
| M29 | [ペイウォール位置](monetization/29-paywall-placement.md) |
| M30 | [提示タイミング](monetization/30-offer-timing.md) |
| M31 | [相手ごとの課金単位](monetization/31-per-target-billing.md) |
| M32 | [いいね追加購入](monetization/32-like-packs.md) |
| M33 | [既読・足あと解放](monetization/33-read-receipts.md) |
| M34 | [検索フィルタ解放](monetization/34-premium-filters.md) |
| M35 | [認証バッジ](monetization/35-verified-badge.md) |

### 収益源の拡張
| # | 指示書 |
| --- | --- |
| M36 | [リワード動画広告](monetization/36-rewarded-ads.md) |
| M37 | [開運グッズ提携](monetization/37-affiliate-goods.md) |
| M38 | [占い師への送客](monetization/38-reader-referral.md) |
| M39 | [鑑定士マーケット](monetization/39-reader-marketplace.md) |
| M40 | [手数料モデル](monetization/40-take-rate.md) |
| M41 | [オンライン鑑定会](monetization/41-live-events.md) |
| M42 | [コミュニティ月額](monetization/42-community-subscription.md) |
| M43 | [お守り・カレンダー物販](monetization/43-merch.md) |
| M44 | [神社仏閣コラボ](monetization/44-shrine-collab.md) |
| M45 | [ブライダル広告枠](monetization/45-bridal-ads.md) |
| M46 | [B2B チーム相性](monetization/46-b2b-team-fit.md) |
| M47 | [API 提供](monetization/47-public-api.md) |
| M48 | [ホワイトラベル](monetization/48-white-label.md) |
| M49 | [統計レポート](monetization/49-aggregate-reports.md) |
| M50 | [ギフト購入](monetization/50-gifting.md) |

## 集客（G01–G50）

### 検索
| # | 指示書 |
| --- | --- |
| G01 | [無料ツールとしての SEO](growth/01-seo-free-tool.md) |
| G02 | [ツール型ランディング](growth/02-tool-landing.md) |
| G03 | [用語辞典の全語ページ化](growth/03-glossary-pages.md) |
| G04 | [生年月日別ページ](growth/04-birthdate-pages.md) |
| G05 | [干支60通りの記事](growth/05-sexagenary-pages.md) |
| G06 | [十神10種の記事](growth/06-ten-gods-pages.md) |
| G07 | [内部リンク設計](growth/07-internal-linking.md) |
| G08 | [構造化データ](growth/08-structured-data.md) |
| G09 | [表示速度](growth/09-performance.md) |
| G10 | [多言語展開](growth/10-i18n-expansion.md) |

### SNS・拡散
| # | 指示書 |
| --- | --- |
| G11 | [結果カード画像](growth/11-share-card-image.md) |
| G12 | [OGP 自動生成](growth/12-dynamic-ogp.md) |
| G13 | [X 定時投稿](growth/13-x-daily-bot.md) |
| G14 | [Instagram 命式カード](growth/14-instagram-cards.md) |
| G15 | [TikTok ショート](growth/15-tiktok-shorts.md) |
| G16 | [YouTube 読み解き](growth/16-youtube-readings.md) |
| G17 | [LINE 公式](growth/17-line-official.md) |
| G18 | [UGC 導線](growth/18-ugc-funnel.md) |
| G19 | [占い師インフルエンサー](growth/19-influencer-program.md) |
| G20 | [招待リワード](growth/20-referral-reward.md) |

### 構造的バイラル
| # | 指示書 |
| --- | --- |
| G21 | [相手の生年月日を招待に変える](growth/21-partner-birthdate-invite.md) |
| G22 | [カップル招待](growth/22-couple-invite.md) |
| G23 | [グループ診断](growth/23-group-reading.md) |
| G24 | [登録前に結果を見せる](growth/24-result-before-signup.md) |
| G25 | [保存で会員化](growth/25-save-to-signup.md) |

### 定着
| # | 指示書 |
| --- | --- |
| G26 | [通知の時間帯](growth/26-push-timing.md) |
| G27 | [連続ログイン](growth/27-streaks.md) |
| G28 | [ホーム画面ウィジェット](growth/28-home-widget.md) |
| G29 | [週次メール](growth/29-weekly-email.md) |
| G30 | [節入り・立春通知](growth/30-solar-term-alerts.md) |
| G31 | [初回30秒](growth/31-fast-first-run.md) |
| G32 | [離脱点の計測](growth/32-funnel-analytics.md) |
| G33 | [A/B テスト](growth/33-ab-testing.md) |
| G34 | [計測基盤](growth/34-analytics-foundation.md) |
| G35 | [コホート分析](growth/35-cohort-analysis.md) |

### 広告・提携
| # | 指示書 |
| --- | --- |
| G36 | [リスティング広告](growth/36-search-ads.md) |
| G37 | [Meta 広告](growth/37-meta-ads.md) |
| G38 | [CPA 上限](growth/38-cpa-guardrail.md) |
| G39 | [アプリ面広告](growth/39-app-network-ads.md) |
| G40 | [ASO](growth/40-aso.md) |
| G41 | [レビュー依頼](growth/41-review-prompt.md) |
| G42 | [PR・メディア](growth/42-pr-media.md) |
| G43 | [婚活イベント提携](growth/43-matchmaking-events.md) |
| G44 | [結婚相談所](growth/44-marriage-agencies.md) |
| G45 | [占い館提携](growth/45-fortune-salons.md) |
| G46 | [大学・学園祭](growth/46-campus.md) |
| G47 | [年末年始](growth/47-new-year-season.md) |
| G48 | [節分・立春キャンペーン](growth/48-risshun-campaign.md) |
| G49 | [誕生日クーポン](growth/49-birthday-coupon.md) |
| G50 | [コミュニティ運営](growth/50-community-ops.md) |

## 重複しないための軸

100本は**単一の軸で切られていない**。以下の6軸が混在しており、
軸が違えば同じ機能に複数の指示書が触るのは正常。逆に**同じ軸で内容が重なったら重複**。

| 軸 | 何を決めるか | 例 |
| --- | --- | --- |
| 商品 | 何を売るか | M11–M22 |
| 課金単位 | どの粒度で課金するか | M03 M04 M31 |
| 価格・提示 | いくらで、どこで見せるか | M26–M30 |
| チャネル | どこから人が来る／届くか | G11–G17 G36–G46 |
| 基盤 | 他が乗る土台 | G34 M05 M26 G07 |
| 制約 | 全体を縛る規律 | G38 M49 |

新しい指示書を足すときは、まず軸を決める。軸を決めずに書くと必ずどれかと重なる。

## 重複監査の結果

同じ実装ファイルを2本以上が主張している箇所を機械検査で洗い出し、内容を突き合わせた。

**修正済み（同一作業を2本が持っていた）**

| 重複 | 修正 |
| --- | --- |
| G02 ⟷ G31 | 入力仕様は G31 が単独で持つ。G02 は画面配置のみ |
| M26 ⟷ M27 | M26 = 価格定義の置き場所、M27 = プラン間の機能差 |
| G24 ⟷ G25 | G24 = 登録を求めない範囲、G25 = 求める瞬間の体験 |
| G03 ⟷ G05/G06 | 辞典は干支60・十神10を生成しない（検索での共食い回避） |
| M46 ⟷ M47 | B2B は独立経路を作らず M47 のスコープとして提供 |
| G19 ⟷ G45 | プロ向け機能は G19 が単独で実装 |
| M12 ⟷ M16/M17 | M12 の場面から仕事・金銭を外す（120→90文） |
| M01 ⟷ M29 | M01 = 機能単位の線引き、M29 = 予告の分量 |
| M39 ⟷ M40 | M40 をパートナー支払いの一元管理に再定義 |
| M42 ⟷ G50 | 会員同期は M42、場の中身は G50 |
| M25 ⟷ M43 | M25 = 印刷・配送基盤、M43 = 商品 |
| G17 ⟷ G26/G29 | 配信内容の生成は G26 に集約、他はチャネル適応 |
| G06 ⟷ G07 | リンク生成器は G07 が単独で持つ |

**重複ではない（親子・依存関係。境界を明記した）**

M06/M07、M15/M21/M31、M22/M18、M03/M50、M38/M39、
G20/G21、G23/G43、G26/G30、G40/G41、G09/G31、G47/G48。

**残る非排他（構造的なもの、修正しない）**

`entitlement.py`（M05 M07 M08 M26 M36 M42）と `daily.py`（M02 M13 M14 M17 M22 G26 G29）は
多数の指示書が参照するが、これは**共有点として設計された**もの。
判定と日次計算を1か所に集約した結果であり、分散させる方が誤り。

## 網羅性（CE）の欠落

以下は100本のどこにも担当が無い。実装時に必ず必要になる。

1. **決済プロバイダの選定とアプリ内課金の扱い** — M02 以降が全て前提にしているが、
   選定と手数料込みの価格設計を決める1本が無い（[M26](monetization/26-three-tier-pricing.md) は置き場所のみ）
2. **解約フロー／ダウングレード** — LTV に最も効くのに、
   [M02](monetization/02-subscription-daily.md) の中で数行触れているだけ
3. **アプリ化の意思決定** — [G28](growth/28-home-widget.md) と
   [G40](growth/40-aso.md) が二度「前提」として言及するが、決める1本が無い

## 着手順

土台となる4本を先に通す。ここが無いと他の指示書の完了条件が測れない。

1. [G34 計測基盤](growth/34-analytics-foundation.md)
2. [M01 無料/有料の線引き](monetization/01-free-paid-line.md)
3. [G24 登録前に結果を見せる](growth/24-result-before-signup.md)
4. [M29 ペイウォール位置](monetization/29-paywall-placement.md)
