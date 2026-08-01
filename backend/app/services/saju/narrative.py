"""強み・弱みの解説文を、チャートの数値から組み立てる。

文言そのものは持たず、フロントが訳せるようキーと差し込む値だけを返す
（相性の ``notes`` と同じ考え方）。1つの ``NarrativeSegment`` が一文にあたり、
フロントは訳文を順につないで一段落にする。

段落は次の5文で構成する。どの組み合わせでも日本語で300〜400字に収まるよう、
文言側の長さを揃えてある。

1. どの軸が突出しているか（実数と外周）
2. 全軸の平均から見てどれだけ離れているか
3. 偏りの強さ（3段階）
4. そのチャートで高い／低いことが何を意味するか
5. 反対側の極との落差
"""

from app.schemas.fortune import NarrativeSegment, RadarAxis

# 偏りの強さの境目。全軸の平均に対する倍率で見る。
_DOMINANT = 1.8  # これ以上高ければ「一点に集まった形」
_CLEAR = 1.25  # これ以上高ければ「一段高い形」
_SCARCE = 0.4  # これ以下なら「はっきりした谷」


def _band(value: float, average: float, *, high: bool) -> str:
    """偏りの強さを3段階のコードで返す。"""
    if high:
        if value >= average * _DOMINANT:
            return "dominant"
        return "clear" if value >= average * _CLEAR else "slight"
    if value <= 0:
        return "absent"
    return "scarce" if value <= average * _SCARCE else "modest"


def build_note(
    chart_key: str,
    axes: list[RadarAxis],
    focus: list[str],
    counterpart: list[str],
    max_value: float,
    *,
    high: bool,
) -> list[NarrativeSegment]:
    """突出した軸についての解説文を組み立てる。

    ``focus`` は解説する側の軸コード、``counterpart`` は反対側の極。
    挙げるほどの偏りが無い側（``focus`` が空）は、解説も付けない。
    """
    if not focus:
        return []

    values = {axis.code: axis.value for axis in axes}
    value = values[focus[0]]
    average = sum(values.values()) / len(values)
    side = "high" if high else "low"

    segments = [
        NarrativeSegment(
            key=f"{side}.lead",
            codes=focus,
            params={"value": value, "max": max_value, "count": len(axes)},
        ),
        NarrativeSegment(
            key=f"{side}.spread",
            params={
                "average": round(average, 1),
                "diff": round(abs(value - average), 1),
                "fill": round(value / max_value * 100, 1),
            },
        ),
        NarrativeSegment(key=f"{side}.band.{_band(value, average, high=high)}"),
        NarrativeSegment(key=f"hint.{chart_key}.{'strength' if high else 'weakness'}"),
    ]

    # 反対側も同点が並びすぎて挙げられないことがある。そのときは落差を語れない。
    if counterpart:
        other = values[counterpart[0]]
        segments.append(
            NarrativeSegment(
                key=f"{side}.counter",
                codes=counterpart,
                params={"value": other, "gap": round(abs(value - other), 1)},
            )
        )
    else:
        segments.append(NarrativeSegment(key=f"{side}.counter_flat"))

    return segments
