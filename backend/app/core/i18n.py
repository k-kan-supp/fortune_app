"""API が返す文言の多言語対応（日本語 / 英語）。

クライアントは `Accept-Language` ヘッダで希望言語を伝える。
文言はキーで持ち、レスポンスを組み立てる直前に翻訳する。
"""

from typing import Literal

Lang = Literal["ja", "en"]

SUPPORTED_LANGS: tuple[Lang, ...] = ("ja", "en")
DEFAULT_LANG: Lang = "ja"

MESSAGES: dict[str, dict[Lang, str]] = {
    # 認証
    "auth.magic_link_sent": {
        "ja": "登録用のリンクをメールで送信しました。ご確認ください。",
        "en": "We've emailed you a sign-up link. Please check your inbox.",
    },
    "auth.link_invalid": {
        "ja": "リンクが無効か、有効期限が切れています。もう一度お試しください。",
        "en": "That link is invalid or has expired. Please try again.",
    },
    "auth.token_invalid": {
        "ja": "無効なトークンです",
        "en": "Invalid token",
    },
    "auth.user_not_found": {
        "ja": "ユーザーが存在しません",
        "en": "User not found",
    },
    # メール本文
    "email.magic_link_subject": {
        "ja": "【四柱推命】登録用リンクのご案内",
        "en": "[Four Pillars] Your sign-up link",
    },
    "email.magic_link_body": {
        "ja": (
            "以下のリンクを開くと登録が完了し、ログインできます。\n"
            "（有効期限: {minutes}分）\n\n"
            "{url}\n\n"
            "心当たりがない場合は、このメールを破棄してください。"
        ),
        "en": (
            "Open the link below to finish signing up and log in.\n"
            "(valid for {minutes} minutes)\n\n"
            "{url}\n\n"
            "If you didn't request this, you can safely ignore this email."
        ),
    },
    # 画像
    "image.unsupported_type": {
        "ja": "対応していない画像形式です（JPEG / PNG / WebP / GIF）。",
        "en": "Unsupported image format (JPEG / PNG / WebP / GIF).",
    },
    "image.unreadable": {
        "ja": "画像として読み込めませんでした。",
        "en": "We couldn't read that file as an image.",
    },
    "image.too_large": {
        "ja": "画像サイズが大きすぎます。",
        "en": "That image is too large.",
    },
    # マッチング
    "matching.self_not_allowed": {
        "ja": "自分自身は対象にできません。",
        "en": "You can't do that to your own account.",
    },
    "matching.match_not_found": {
        "ja": "マッチが見つかりません。",
        "en": "Match not found.",
    },
    "matching.user_not_found": {
        "ja": "ユーザーが見つかりません。",
        "en": "User not found.",
    },
    "matching.birthday_missing": {
        "ja": "お互いの生年月日が登録されていないと相性を出せません。",
        "en": "Compatibility needs a birth date on both profiles.",
    },
    "matching.invalid_user_id": {
        "ja": "不正なユーザーIDです。",
        "en": "Invalid user ID.",
    },
}


def resolve_lang(accept_language: str | None) -> Lang:
    """`Accept-Language` ヘッダから対応言語を選ぶ。

    ``ja,en-US;q=0.8`` のように品質値付きで届くので、q の高い順に見て
    最初に対応している言語を返す。該当が無ければ既定の日本語。
    """
    if not accept_language:
        return DEFAULT_LANG

    entries: list[tuple[float, str]] = []
    for part in accept_language.split(","):
        tag, _, params = part.strip().partition(";")
        tag = tag.strip().lower()
        if not tag:
            continue
        quality = 1.0
        if params.strip().startswith("q="):
            try:
                quality = float(params.strip()[2:])
            except ValueError:
                quality = 0.0
        entries.append((quality, tag))

    for _, tag in sorted(entries, key=lambda e: e[0], reverse=True):
        if tag == "*":
            return DEFAULT_LANG
        primary = tag.split("-")[0]
        if primary in SUPPORTED_LANGS:
            return primary
    return DEFAULT_LANG


def translate(key: str, lang: Lang = DEFAULT_LANG, **params: object) -> str:
    """メッセージキーを翻訳する。未知のキーはそのまま返す（開発時の気づき用）。"""
    entry = MESSAGES.get(key)
    if entry is None:
        return key
    text = entry.get(lang) or entry[DEFAULT_LANG]
    return text.format(**params) if params else text
