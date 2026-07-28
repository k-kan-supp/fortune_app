import pytest
from fastapi.testclient import TestClient

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
