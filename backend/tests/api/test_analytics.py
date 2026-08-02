from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def post(events, *, consent=True):
    return client.post("/api/analytics/events", json={"events": events, "consent": consent})


def test_accepts_registered_events():
    res = post([{"name": "fortune_calculated", "props": {"day_stem": "甲", "time_known": True}}])
    assert res.status_code == 202
    assert res.json() == {"accepted": 1, "dropped": 0}


def test_rejects_unregistered_event():
    """名前の揺れをここで止める。通してしまうと後から集計できない。"""
    res = post([{"name": "fortune_calculated_v2", "props": {}}])
    assert res.status_code == 422
    assert "unregistered" in res.json()["detail"]


def test_rejects_birth_date_in_props():
    """生年月日を計測に載せない。画面側の型だけに任せず、サーバでも落とす。"""
    res = post([{"name": "fortune_calculated", "props": {"birth_year": 1990}}])
    assert res.status_code == 422
    assert "birth_year" in res.json()["detail"]


def test_rejects_email_in_props():
    res = post([{"name": "signup_completed", "props": {"email": "a@b.c"}}])
    assert res.status_code == 422


def test_drops_events_without_consent():
    """同意前は画面側の計測を通さない。受理数と破棄数を分けて返す。"""
    res = post([{"name": "page_viewed", "props": {"path": "/"}}], consent=False)
    assert res.status_code == 202
    assert res.json() == {"accepted": 0, "dropped": 1}


def test_rejects_oversized_batch():
    res = post([{"name": "page_viewed", "props": {"path": "/"}}] * 51)
    assert res.status_code == 422


def test_rejects_empty_batch():
    res = post([])
    assert res.status_code == 422
