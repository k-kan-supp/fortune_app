from app.core.i18n import resolve_lang, translate


def test_resolve_lang_defaults_to_japanese():
    assert resolve_lang(None) == "ja"
    assert resolve_lang("") == "ja"


def test_resolve_lang_reads_simple_tag():
    assert resolve_lang("en") == "en"
    assert resolve_lang("en-US") == "en"


def test_resolve_lang_uses_highest_quality_supported_language():
    # q 値が高い方を優先する（en=0.9 > ja=0.8）
    assert resolve_lang("en-US,en;q=0.9,ja;q=0.8") == "en"
    assert resolve_lang("en;q=0.5,ja;q=0.9") == "ja"


def test_resolve_lang_falls_back_for_unsupported_language():
    assert resolve_lang("fr-FR,fr;q=0.9") == "ja"
    assert resolve_lang("*") == "ja"


def test_translate_returns_language_specific_text():
    assert translate("matching.match_not_found", "ja") == "マッチが見つかりません。"
    assert translate("matching.match_not_found", "en") == "Match not found."


def test_translate_fills_placeholders():
    body = translate("email.magic_link_body", "en", url="https://example.test", minutes=15)
    assert "https://example.test" in body
    assert "15" in body


def test_translate_passes_through_unknown_key():
    assert translate("no.such.key", "en") == "no.such.key"
