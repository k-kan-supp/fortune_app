# アーキテクチャ / ディレクトリ構成

```
fortune/
├── README.md
├── .gitignore
├── docs/
│   └── architecture.md
│
├── backend/                        # Python + FastAPI
│   ├── pyproject.toml              # 依存・ツール設定 (ruff / mypy / pytest)
│   ├── .env.example
│   └── app/
│       ├── main.py                 # FastAPI エントリポイント
│       ├── core/                   # 設定・共通基盤
│       │   └── config.py           # 環境変数 (pydantic-settings)
│       ├── api/                    # HTTPレイヤー (入出力のみ)
│       │   ├── deps.py             # 依存性注入
│       │   └── routes/
│       │       └── fortune.py      # /api/fortune エンドポイント
│       ├── schemas/                # Pydantic (リクエスト/レスポンス契約)
│       │   └── fortune.py
│       ├── services/               # ドメインロジック (フレームワーク非依存)
│       │   └── saju/               # 四柱推命の計算本体
│       │       ├── calendar.py     # 太陽暦→干支・節入り計算
│       │       ├── pillars.py      # 年月日時の四柱算出
│       │       ├── ten_gods.py     # 十神
│       │       ├── hidden_stems.py # 蔵干
│       │       └── constants.py    # 十干・十二支・五行テーブル
│       ├── models/                 # (将来) DBモデル
│       └── tests/
│
└── frontend/                       # React + Vite + TypeScript
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.tsx                # エントリポイント
        ├── App.tsx
        ├── pages/                  # 画面単位
        ├── features/               # 機能単位のまとまり
        │   └── fortune/            # 四柱推命機能一式
        │       ├── api/            # この機能のAPI呼び出し
        │       ├── components/     # 入力フォーム・命式表示など
        │       ├── hooks/          # useFortune など
        │       └── types/          # ドメイン型
        ├── components/             # 横断的な再利用UI
        │   ├── ui/                 # ボタン等プリミティブ
        │   └── layout/             # ヘッダー・レイアウト
        ├── api/                    # APIクライアント基盤 (fetchラッパ)
        ├── hooks/                  # 横断カスタムフック
        ├── lib/                    # 汎用ユーティリティ
        ├── types/                  # グローバル型
        └── styles/                # グローバルCSS
```

## 設計方針

### バックエンド（レイヤー分離）

```
routes (HTTP)  →  schemas (契約)  →  services/saju (純粋ロジック)
```

- **`services/saju/` はフレームワークに依存しない**純粋な Python にする。
  こうすることで四柱推命ロジックを単体テストしやすく、CLI 等からも再利用できる。
- `routes` は「受け取って service を呼び、結果を返す」だけに薄く保つ。
- 干支や節入りの計算は誤差が命取りなので、`sxtwl`（寿星天文暦）を用いて
  天文計算ベースで節気を求める。

### フロントエンド（feature-based）

- 画面横断で使うものは `components/` `hooks/` `lib/`、
  機能に固有のものは `features/<機能名>/` にまとめる
  （`fortune` / `auth` / `profile`）。
- API 呼び出しは各 feature の `api/` に閉じ込め、
  UI コンポーネントから直接 fetch しない。

## 認証・ユーザー機能

### 登録（パスワードレス / マジックリンク）

```
POST /api/auth/magic-link {email}   仮ユーザー作成 → ワンタイムトークン発行 → メール送信
GET  /auth/verify?token=...         メールのリンク（フロント画面）
POST /api/auth/verify {token}       トークン検証 → is_verified=true → JWT 発行（ログイン）
GET  /api/auth/me                   Bearer JWT から現在ユーザー取得
```

- 生トークンは保存せず SHA-256 ハッシュのみ DB 保持。有効期限15分・使い切り。
- メール送信は `services/email/` で抽象化（開発は Console、本番は SMTP/API へ差し替え）。

### プロフィール & アイコン

```
GET    /api/profile/me          プロフィール取得（無ければ空で作成）
PUT    /api/profile/me          プロフィール項目を更新
PUT    /api/profile/me/avatar   アイコン画像アップロード（multipart）
DELETE /api/profile/me/avatar   アイコン削除
```

- `User`（認証）と `UserProfile`（1:1）で関心を分離。
- 項目: 表示名 / 生年月日時 / 性別 / 身長 / 体重 / 体型 / 血液型 / 職業 /
  学歴 / 居住地 / 婚姻歴 / 喫煙 / 飲酒 / 自己紹介 など（マッチング一般の項目）。
  選択肢の値は `schemas/profile.py` の `Literal` 型と
  フロントの `features/profile/constants.ts` を一致させて管理する。
- スキーマは `ProfileOut(ProfileUpdate)` の継承で編集項目を一元管理。
  項目追加はモデル・スキーマ・マイグレーション・フロント定数の4点更新で済む
  （`to_out` は `ProfileUpdate.model_fields` を走査するため変更不要）。
- アイコンは Pillow で検証 → 正方形クロップ → 512px WebP に正規化して保存。
- ファイル保存は `services/storage/` で抽象化（開発は Local、本番は S3/GCS へ差し替え）。
  ローカル保存分は `/uploads` に StaticFiles でマウントして配信。
