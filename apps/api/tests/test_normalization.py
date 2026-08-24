from app.services.normalization import normalize_page_text


def test_rejoins_hyphenated_line_breaks():
    assert normalize_page_text("represen-\ntation") == "representation"


def test_leaves_real_compounds_alone():
    # Not a hyphenation artefact — the hyphen belongs to the term.
    out = normalize_page_text("state-\nof-the-art results")
    assert "state-of-the-art" in out


def test_single_newlines_become_spaces_but_paragraphs_survive():
    out = normalize_page_text("first line\nsame paragraph\n\nnew paragraph")
    assert out == "first line same paragraph\n\nnew paragraph"


def test_whitespace_padded_blank_lines_still_break_paragraphs():
    """PDFs pad lines with spaces, so a 'blank' line is not actually empty.

    Sprint 3's paragraph-aware chunker depends on these breaks surviving.
    """
    raw = "First paragraph text.   \n   \nSecond paragraph text."
    assert normalize_page_text(raw) == "First paragraph text.\n\nSecond paragraph text."


def test_collapses_excess_blank_lines_and_spaces():
    assert normalize_page_text("a\n\n\n\nb") == "a\n\nb"
    assert normalize_page_text("too    many     spaces") == "too many spaces"


def test_expands_ligatures():
    assert normalize_page_text("eﬃcient classiﬁcation") == "efficient classification"


def test_strips_zero_width_and_control_characters():
    assert normalize_page_text("clean​text\x07here") == "cleantexthere"


def test_normalizes_odd_unicode_spaces():
    assert normalize_page_text("a b c") == "a b c"


def test_empty_input_is_safe():
    assert normalize_page_text("") == ""
    assert normalize_page_text("   \n\n  ") == ""
