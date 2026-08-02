"""解説文の有料・無料の線引き。

命式そのもの（四柱・十神・蔵干・チャートの数値）は完全に無料で出し切る。
検索流入はこれが無料であることの上に成り立っているので、囲うと集客が死ぬ。
売るのは「その配置が自分にとって何を意味するか」＝解説文の側。

無料側にも解説を1枚だけ残す。全部隠すと無料の結果が数字の羅列になり、
読み物として成立しないうえ、有料側の価値も伝わらなくなる。

ここが決めるのは**どの解説が有料か**まで。誰がそれを見られるかは知らない
（占術ロジックに課金概念を持ち込まない）。開放の判定は API 層の仕事。
"""

from typing import Final

FREE: Final = "free"
PAID: Final = "paid"

# 五行は命式の基本。ここが読めないと結果が数字の羅列になるので無料に残す。
_FREE_NOTE_CHARTS: Final[frozenset[str]] = frozenset({"five_elements"})


def note_tier(chart_key: str) -> str:
    """そのチャートの解説文が無料か有料かを返す。"""
    return FREE if chart_key in _FREE_NOTE_CHARTS else PAID
