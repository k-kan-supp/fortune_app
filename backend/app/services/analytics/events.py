"""計測イベントの定義と検査。

資産になるのはベンダーではなく**イベント設計**なので、名前とプロパティの規律を
ここ1か所に置く。送信先は後から差し替えられるが、名前が揺れると過去のデータと
繋がらなくなり、そちらは取り返しがつかない。

規律は3つ。

1. 名前は ``<対象>_<動作>``。登録済みの名前しか受け付けない。
2. プロパティに個人を特定し得る値を載せない。分析に要るのは日干や五行の分布で
   あって、生年月日そのものではない。
3. 同意が要るイベントと、要らないイベントを分ける。
"""

import logging
import re
from typing import Final

logger = logging.getLogger("app.analytics")

# イベントのプロパティに使える値。自由な入れ子を許すと、後から何でも入る。
PropValue = str | int | float | bool | None

# <対象>_<動作>。動作を後ろに置くと、一覧が対象ごとに並ぶ。
_NAME_RULE: Final = re.compile(r"^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$")

# プロパティ名に含まれていたら弾く断片。誤検出しない語だけに絞る
# （"lat" などは "related" に当たるので入れない）。
_PERSONAL_FRAGMENTS: Final[tuple[str, ...]] = (
    "birth",
    "dob",
    "email",
    "phone",
    "address",
    "name",
)

# 画面から送ってよいイベント。ここに無い名前は受け付けない。
CLIENT_EVENTS: Final[frozenset[str]] = frozenset(
    {
        "page_viewed",
        "fortune_input_started",
        "fortune_calculated",
        "result_viewed",
        "result_scrolled",
        "paywall_shown",
        "paywall_dismissed",
        "signup_started",
        "signup_completed",
    }
)

# 課金に関わる数字をクライアントの送信に依存させない。ここはサーバからのみ送る。
SERVER_EVENTS: Final[frozenset[str]] = frozenset(
    {
        "purchase_completed",
        "purchase_failed",
        "subscription_started",
        "subscription_canceled",
    }
)

# 同意前でも記録するもの。取引の記録はサービスの提供そのものに必要で、
# 分析目的ではない。画面側の計測は全て同意が要る。
ESSENTIAL_EVENTS: Final[frozenset[str]] = SERVER_EVENTS


def _check_registry() -> None:
    """登録名が規則に合っているかを起動時に確かめる。"""
    overlap = CLIENT_EVENTS & SERVER_EVENTS
    if overlap:
        raise ValueError(f"client と server の両方に登録されている: {sorted(overlap)}")
    for name in CLIENT_EVENTS | SERVER_EVENTS:
        if not _NAME_RULE.match(name):
            raise ValueError(f"イベント名が <対象>_<動作> になっていない: {name}")


_check_registry()


def personal_keys(props: dict[str, PropValue]) -> list[str]:
    """個人を特定し得るプロパティ名を返す。空なら安全。"""
    return sorted(
        key
        for key in props
        if any(fragment in key.lower() for fragment in _PERSONAL_FRAGMENTS)
    )


def requires_consent(name: str) -> bool:
    return name not in ESSENTIAL_EVENTS


def emit(
    name: str,
    props: dict[str, PropValue],
    *,
    source: str,
    acquired_from: str | None = None,
) -> None:
    """イベントを1件記録する。

    送信先は当面ログ。収集基盤を入れるときはこの関数の中だけを差し替える
    ── 呼び出し側にベンダーを漏らさないことが、後で移行できる条件になる。
    """
    logger.info(
        "event",
        extra={
            "event": name,
            "source": source,
            # 流入元。これが最後まで残らないと CPA が計算できない。
            "acquired_from": acquired_from or "unknown",
            "props": props,
        },
    )
