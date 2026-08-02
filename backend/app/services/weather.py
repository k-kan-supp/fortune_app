"""Open-Meteo から当日の気象を取る。

このアプリで唯一の外部通信。占術ロジック（services/saju/）には持ち込まず、
ここで取ってきた素の観測値だけを渡す。取れなければ日運は出さない。

API キーは不要。取得は 15 分だけ地点ごとにキャッシュする（提供側の更新間隔に合わせる）。
"""

import json
import logging
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from typing import Any

from app.schemas.fortune import WeatherReading

logger = logging.getLogger("app.weather")

ENDPOINT = "https://api.open-meteo.com/v1/forecast"
TIMEOUT_SECONDS = 6.0
CACHE_SECONDS = 900

# 地点の指定が無いときの既定（東京）。
DEFAULT_LATITUDE = 35.6762
DEFAULT_LONGITUDE = 139.6503

_cache: dict[tuple[float, float], tuple[float, WeatherReading]] = {}


def _parse(payload: Any) -> WeatherReading:
    """Open-Meteo の応答を、こちらの形に畳む。

    形が変わっていれば KeyError / ValueError になり、呼び出し側が None に倒す。
    """
    current = payload["current"]
    daily = payload["daily"]
    sunrise, sunset = daily["sunrise"][0], daily["sunset"][0]
    span = datetime.fromisoformat(sunset) - datetime.fromisoformat(sunrise)
    hours = span.total_seconds() / 3600

    return WeatherReading(
        date=daily["time"][0],
        temperature_c=float(current["temperature_2m"]),
        humidity_pct=float(current["relative_humidity_2m"]),
        weather_code=int(current["weather_code"]),
        sunrise=sunrise,
        sunset=sunset,
        daylight_hours=round(hours, 2),
        latitude=float(payload["latitude"]),
        longitude=float(payload["longitude"]),
    )


def fetch(latitude: float | None, longitude: float | None) -> WeatherReading | None:
    """指定地点の当日の気象。取得できなければ None。"""
    lat = DEFAULT_LATITUDE if latitude is None else latitude
    lon = DEFAULT_LONGITUDE if longitude is None else longitude
    key = (round(lat, 2), round(lon, 2))

    cached = _cache.get(key)
    if cached and time.monotonic() - cached[0] < CACHE_SECONDS:
        return cached[1]

    query = urllib.parse.urlencode(
        {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,weather_code",
            "daily": "sunrise,sunset",
            "timezone": "auto",
            "forecast_days": 1,
        }
    )
    try:
        with urllib.request.urlopen(f"{ENDPOINT}?{query}", timeout=TIMEOUT_SECONDS) as res:
            reading = _parse(json.load(res))
    except (urllib.error.URLError, TimeoutError, KeyError, ValueError, OSError) as exc:
        # 地点も生年月日も載せない。落ちた理由だけ残す。
        logger.warning("weather fetch failed", extra={"reason": type(exc).__name__})
        return None

    _cache[key] = (time.monotonic(), reading)
    return reading
