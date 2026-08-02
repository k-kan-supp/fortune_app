"""その日の空気を五行に置き換え、命式と重ねて日運を出す。

気温・湿度・日照時間・空模様を、古典の対応にならって五行に振り分ける::

    木 — 春・風。温暖で湿り気のある、伸びる条件
    火 — 夏・暑・熱。高温と長い日照、晴天
    土 — 土用・湿・停滞。曇りや霧、中庸の湿り
    金 — 秋・燥・涼。乾いて涼しい晴れ
    水 — 冬・寒・雨雪。降水と低温

点数は「その日の空気が、命式の偏りをどれだけ埋めるか」で測る。
足りない気が外から補われる日ほど高く、すでに多い気がさらに増える日ほど低い。
相性の「支え合い」と同じ考え方で、残っていた偏りの何割が埋まったかを見る。

文言は持たず、フロントが訳せるようコードだけを返す。
"""

from functools import lru_cache

from app.services.saju.analysis import element_evenness
from app.services.saju.constants import FIVE_ELEMENTS

# WMO の天気コード → 空模様。Open-Meteo が返すコード体系。
SKY_CODES: dict[str, tuple[int, ...]] = {
    "clear": (0, 1),
    "cloudy": (2, 3),
    "fog": (45, 48),
    "rain": (51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82),
    "snow": (71, 73, 75, 77, 85, 86),
    "storm": (95, 96, 99),
}

# 空模様ごとの補正（掛ける）。晴れは火と金、雨は水と木、曇り霧は土を厚くする。
SKY_BOOST: dict[str, dict[str, float]] = {
    "clear": {"火": 1.25, "金": 1.15},
    "cloudy": {"土": 1.25},
    "fog": {"土": 1.35, "水": 1.10},
    "rain": {"水": 1.45, "木": 1.15},
    "snow": {"水": 1.50, "金": 1.10},
    "storm": {"火": 1.20, "水": 1.30},
}

# 正規化の基準。日本の気候でおおむね端に届く値を取ってある。
TEMP_RANGE = (-5.0, 35.0)
DAYLIGHT_RANGE = (9.5, 14.5)


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def sky_of(weather_code: int) -> str:
    """天気コードを空模様に畳む。未知のコードは曇り扱い。"""
    for sky, codes in SKY_CODES.items():
        if weather_code in codes:
            return sky
    return "cloudy"


def day_elements(
    temperature_c: float, humidity_pct: float, daylight_hours: float, sky: str
) -> dict[str, float]:
    """その日の空気の五行構成比（合計 1）。"""
    heat = _clamp01((temperature_c - TEMP_RANGE[0]) / (TEMP_RANGE[1] - TEMP_RANGE[0]))
    damp = _clamp01(humidity_pct / 100)
    sun = _clamp01((daylight_hours - DAYLIGHT_RANGE[0]) / (DAYLIGHT_RANGE[1] - DAYLIGHT_RANGE[0]))

    raw = {
        # 春の条件（温暖かつ湿潤）に近いほど木が立つ
        "木": _clamp01(1 - abs(heat - 0.55) * 2) * (0.5 + 0.5 * damp),
        "火": 0.65 * heat + 0.35 * sun,
        # 中庸の湿りと、日の短さ（＝陽が伸びきらない停滞）
        "土": _clamp01(1 - abs(damp - 0.6) * 2) * 0.6 + 0.4 * (1 - sun),
        "金": 0.6 * (1 - damp) + 0.4 * (1 - heat),
        "水": 0.6 * damp + 0.4 * (1 - heat),
    }
    for element, factor in SKY_BOOST.get(sky, {}).items():
        raw[element] *= factor

    total = sum(raw.values())
    if total <= 0:  # 全て 0 になる入力は無いが、割り算の保険
        return {el: 1 / len(FIVE_ELEMENTS) for el in FIVE_ELEMENTS}
    return {el: raw[el] / total for el in FIVE_ELEMENTS}


def balance_gain(chart: dict[str, float], day: dict[str, float]) -> float:
    """その日の空気が命式の偏りをどれだけ埋めるか（素点）。

    残っていた偏りの何割が埋まったか。埋めれば正、かえって偏りを深めれば負。
    ここで 0 に刈り取ってしまうと「悪化した日」が全部同じ値に潰れ、
    偏りの強い命式がいつ見ても 0 点になる。刈り取りは正規化のあとで行う。
    """
    alone = element_evenness(chart)
    if alone >= 100:
        return 0.0  # もともと均衡している命式は、どの日でも動かしようがない
    merged = element_evenness({el: (chart[el] + day[el]) / 2 for el in FIVE_ELEMENTS})
    return (merged - alone) / (100 - alone) * 100


def _reachable_days() -> tuple[dict[str, float], ...]:
    """起こりうる空気を並べる。正規化の基準になる一覧。

    素点の取りうる幅は命式によって違い、そのままだと「いつ見ても低い」人が出る。
    そこでこの一覧で本人の下端・上端を測り、0〜100 に伸ばす。

    一覧は ``day_elements`` が受け付ける入力空間の全域を格子で覆う。
    季節の近似式で作ると実測がその外に出て（真夏の 31℃ など）点数が端に
    張り付くので、関数が丸める範囲そのものを基準にする。
    """
    temperatures = [
        TEMP_RANGE[0] + (TEMP_RANGE[1] - TEMP_RANGE[0]) * i / (_GRID_T - 1) for i in range(_GRID_T)
    ]
    humidities = [100 * i / (_GRID_H - 1) for i in range(_GRID_H)]
    daylights = [
        DAYLIGHT_RANGE[0] + (DAYLIGHT_RANGE[1] - DAYLIGHT_RANGE[0]) * i / (_GRID_D - 1)
        for i in range(_GRID_D)
    ]
    return tuple(
        day_elements(temperature, humidity, daylight, sky)
        for temperature in temperatures
        for humidity in humidities
        for daylight in daylights
        for sky in SKY_CODES
    )


# 格子の粗さ。細かくするほど基準は正確になるが、1 回の鑑定で全点を評価する。
_GRID_T, _GRID_H, _GRID_D = 9, 9, 5


REACHABLE_DAYS = _reachable_days()


@lru_cache(maxsize=512)
def _span_for(ratios: tuple[float, ...]) -> tuple[float, float]:
    """下端・上端の実測。基準の全点を評価するので、命式ごとに覚えておく。"""
    chart = dict(zip(FIVE_ELEMENTS, ratios, strict=True))
    scores = [balance_gain(chart, day) for day in REACHABLE_DAYS]
    return min(scores), max(scores)


def personal_span(chart: dict[str, float]) -> tuple[float, float]:
    """その命式が取りうる素点の下端と上端。"""
    return _span_for(tuple(chart[el] for el in FIVE_ELEMENTS))


def daily_score(chart: dict[str, float], day: dict[str, float]) -> float:
    """今日の運勢（0〜100）。本人が取りうる幅の中で今日がどこかを示す。"""
    low, high = personal_span(chart)
    if high <= low:  # もともと均衡していて動かない命式
        return 50.0
    gain = balance_gain(chart, day)
    return round(max(0.0, min(100.0, (gain - low) / (high - low) * 100)), 1)


def element_moves(chart: dict[str, float], day: dict[str, float]) -> tuple[list[str], list[str]]:
    """今日補われる五行と、今日さらに増える五行。

    平均（0.2）に届いていない気を空気が足してくれるなら「補われる」、
    すでに平均を超えている気をさらに厚くするなら「増えすぎる」。
    """
    balanced = 1 / len(FIVE_ELEMENTS)
    fills = [el for el in FIVE_ELEMENTS if chart[el] < balanced and day[el] > chart[el]]
    floods = [el for el in FIVE_ELEMENTS if chart[el] > balanced and day[el] > chart[el]]
    return fills, floods
