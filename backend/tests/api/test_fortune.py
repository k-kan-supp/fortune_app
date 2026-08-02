import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_create_fortune():
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["day_master"] in list("甲乙丙丁戊己庚辛壬癸")
    assert body["day_pillar"]["ten_god"] == "比肩"  # 日主自身は比肩

    # レーダーチャート10種が、軸の値が外周を超えない形で返る
    charts = body["charts"]
    assert len(charts) == 10
    for chart in charts:
        assert chart["axes"], chart["key"]
        assert all(0 <= a["value"] <= chart["max_value"] for a in chart["axes"]), chart["key"]


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_paid_notes_do_not_leak_when_the_paywall_is_on(monkeypatch):
    """未開放のレスポンスに有料の本文が1文字も含まれないこと。

    ここが漏れると課金設計そのものが無意味になるので、キーの有無ではなく
    「本文が空であること」と「命式側は無傷であること」を両方見る。
    """
    monkeypatch.setattr(settings, "paywall_enabled", True)
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    assert res.status_code == 200
    body = res.json()

    for chart in body["charts"]:
        if chart["note_tier"] == "paid":
            assert chart["note_locked"] is True, chart["key"]
            assert chart["strength_note"] == [], chart["key"]
            assert chart["weakness_note"] == [], chart["key"]
            # 何が隠れているかは見せる。隠すと課金動機が生まれない。
            assert "strengths" in chart
        else:
            assert chart["note_locked"] is False, chart["key"]

    # 命式そのものは無料のまま出し切る
    assert body["day_pillar"]["ten_god"] == "比肩"
    assert body["day_pillar"]["hidden_stems"]
    assert all(chart["axes"] for chart in body["charts"])


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_notes_are_open_while_there_is_nothing_to_buy():
    """決済が無い間は開けておく。買えない有料区画を作らない。"""
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    charts = res.json()["charts"]
    assert all(not chart["note_locked"] for chart in charts)
    assert any(chart["strength_note"] or chart["weakness_note"] for chart in charts)
