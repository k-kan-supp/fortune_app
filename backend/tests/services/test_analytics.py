import pytest

from app.services.analytics.events import (
    _NAME_RULE,
    CLIENT_EVENTS,
    ESSENTIAL_EVENTS,
    SERVER_EVENTS,
    personal_keys,
    requires_consent,
)


def test_registered_names_follow_the_rule():
    """<対象>_<動作> から外れた名前が紛れ込んでいないこと。"""
    for name in CLIENT_EVENTS | SERVER_EVENTS:
        assert _NAME_RULE.match(name), name


def test_client_and_server_events_do_not_overlap():
    """同じイベントを両側から送ると二重に数えられる。"""
    assert not (CLIENT_EVENTS & SERVER_EVENTS)


def test_purchase_events_are_server_side():
    """課金の数字をクライアントの送信に依存させない。"""
    assert "purchase_completed" in SERVER_EVENTS
    assert "purchase_completed" not in CLIENT_EVENTS


@pytest.mark.parametrize(
    "key",
    ["birth_year", "birthdate", "dob", "email", "user_email", "phone", "address", "full_name"],
)
def test_personal_keys_are_detected(key):
    assert personal_keys({key: "x"}) == [key]


@pytest.mark.parametrize(
    "key",
    ["day_stem", "time_known", "chart_count", "section", "path", "trigger", "plan"],
)
def test_analysis_keys_pass(key):
    """分析に必要なプロパティが誤検出されないこと。"""
    assert personal_keys({key: "x"}) == []


def test_personal_keys_reports_every_offender():
    assert personal_keys({"birth_year": 1990, "email": "a@b.c", "day_stem": "甲"}) == [
        "birth_year",
        "email",
    ]


def test_client_events_all_require_consent():
    """画面側の計測は同意なしに送らない。"""
    assert all(requires_consent(name) for name in CLIENT_EVENTS)


def test_transaction_records_do_not_require_consent():
    """取引の記録は分析目的ではないので、同意の対象にしない。"""
    assert ESSENTIAL_EVENTS == SERVER_EVENTS
    assert not requires_consent("purchase_completed")
