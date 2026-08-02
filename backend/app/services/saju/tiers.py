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


# 引きの強さ。「読みたくなる度合い」であって、正しさや重要度ではない。
#
# lead / spread は図から読み取れる事実の言い換えなので、見せても減るものが無い。
# hint は「その形があなたにとって何を意味するか」で、ここが商品の中身そのもの。
# 予告はこの直前で切る ── 一番刺さる一文を渡してしまうと、続きを読む理由が消える。
_HOOK_STRENGTH: Final[dict[str, int]] = {
    "lead": 1,
    "spread": 1,
    "band": 2,
    "counter": 2,
    "counter_flat": 2,
    "hint": 3,
}
_STRONG_HOOK: Final = 3


def _kind(segment_key: str) -> str:
    """``high.band.dominant`` → ``band`` のように、一文の種類を取り出す。"""
    if segment_key.startswith("hint."):
        return "hint"
    parts = segment_key.split(".")
    return parts[1] if len(parts) > 1 else parts[0]


def hook_strength(segment_key: str) -> int:
    return _HOOK_STRENGTH.get(_kind(segment_key), 1)


def preview_length(segment_keys: list[str], limit: int) -> int:
    """予告として見せる文の数を返す。

    上限で機械的に切ると、命式によっては「つまらない所で切れる」ことも
    「刺さる一文を渡してしまう」ことも起きる。強い引きが来る手前で必ず止め、
    そのうえで上限を超えないようにする。
    """
    if limit <= 0:
        return 0
    for index, key in enumerate(segment_keys):
        if hook_strength(key) >= _STRONG_HOOK:
            return min(limit, index)
    return min(limit, len(segment_keys))
