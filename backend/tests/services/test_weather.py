"""気象の取得。通信はせず、応答の畳み方と失敗時の振る舞いだけを確かめる。"""

from app.services import weather

PAYLOAD = {
    "latitude": 35.7,
    "longitude": 139.625,
    "current": {"temperature_2m": 31.1, "relative_humidity_2m": 74, "weather_code": 0},
    "daily": {
        "time": ["2026-08-02"],
        "sunrise": ["2026-08-02T04:50"],
        "sunset": ["2026-08-02T18:45"],
    },
}


def test_parses_the_open_meteo_shape():
    reading = weather._parse(PAYLOAD)
    assert reading.date == "2026-08-02"
    assert reading.temperature_c == 31.1
    assert reading.humidity_pct == 74
    assert reading.weather_code == 0
    assert reading.daylight_hours == 13.92  # 04:50 → 18:45


def test_missing_fields_raise_so_the_caller_can_fall_back():
    """形が変わったら例外にする。fetch 側がそれを None に倒す。"""
    for drop in ("current", "daily"):
        broken = {k: v for k, v in PAYLOAD.items() if k != drop}
        try:
            weather._parse(broken)
        except KeyError:
            continue
        raise AssertionError(f"{drop} が無いのに通ってしまった")


def test_fetch_returns_none_when_the_request_fails(monkeypatch):
    def boom(*args, **kwargs):
        raise TimeoutError

    monkeypatch.setattr(weather.urllib.request, "urlopen", boom)
    weather._cache.clear()
    assert weather.fetch(35.0, 139.0) is None
