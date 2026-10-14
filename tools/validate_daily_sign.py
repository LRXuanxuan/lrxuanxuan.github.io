#!/usr/bin/env python3
"""Validate daily-sign entries before the GitHub Pages build (stdlib only)."""
from __future__ import annotations

import json
import math
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POOL = ROOT / "assets/data/quote-pool.json"
ASPECTS = {
    "lantern", "forge", "edge", "winter", "heart", "grail", "moth",
    "knock", "histories", "rose", "nectar", "sky", "scale", "moon",
}
THEMES = {"reflection", "scenery", "inspiration"}
SOURCE_TYPES = {"fiction", "poetry", "nonfiction", "film", "song", "speech", "other"}
STRING_FIELDS = ("id", "text", "book", "author", "chapter", "readerLink", "theme", "aspect")
BAD_UNICODE = re.compile(r"[\x00-\x08\x0b-\x1f\u200b-\u200f\ufeff\ufffc\ufffd]")
NOISY_TITLE = re.compile(r"(?i)z-library|1lib\.sk|\.pdf$|纯文字版$")
UNIQUE_ID = re.compile(r"^[0-9a-f]{64}$")

# Creators explicitly excluded from future daily-sign imports by the site owner.
# Include common simplified/traditional/Japanese character variants.
BLOCKED_CREATOR_NAMES = ("樱雪丸", "櫻雪丸", "桜雪丸")
# Also reject a previously imported title if future data arrives with missing credits.
BLOCKED_KNOWN_TITLES = ("高清日本史5战国时代:逐鹿关原",)


def normalized_credit(value: str) -> str:
    """Normalize spaces and width variants without changing other author names."""
    return re.sub(r"\\s+", "", unicodedata.normalize("NFKC", value))


def is_blocked_entry(author: str, book: str) -> bool:
    credit = normalized_credit(author)
    title = normalized_credit(book)
    return any(name in credit for name in BLOCKED_CREATOR_NAMES) or title in BLOCKED_KNOWN_TITLES



def check_pool(pool: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(pool, dict):
        return ["Root should be a JSON object"]
    quotes = pool.get("quotes")
    if pool.get("version") != 3:
        errors.append("Root.version must remain 3")
    if not isinstance(quotes, list) or not quotes:
        return errors + ["Root.quotes must be a nonempty array"]
    if type(pool.get("count")) is not int or pool["count"] != len(quotes):
        errors.append(f"count must equal quotes.length ({len(quotes)})")

    ids: set[str] = set()
    texts: set[str] = set()
    for i, row in enumerate(quotes):
        label = f"quotes[{i}]"
        if not isinstance(row, dict):
            errors.append(f"{label}: expected object")
            continue
        for key in STRING_FIELDS:
            if not isinstance(row.get(key), str):
                errors.append(f"{label}.{key}: missing or not a string")
        if any(not isinstance(row.get(k), str) for k in STRING_FIELDS):
            continue
        sign_id, quote_text, book = row["id"], row["text"], row["book"]
        if is_blocked_entry(row["author"], book):
            errors.append(f"{label}: creator is on the site owner\'s daily-sign exclusion list")
        if not UNIQUE_ID.fullmatch(sign_id):
            errors.append(f"{label}.id: expected permanent 64-character lowercase hex ID")
        if sign_id in ids:
            errors.append(f"{label}.id: duplicate {sign_id}")
        ids.add(sign_id)
        if not quote_text.strip() or not book.strip():
            errors.append(f"{label}: text and book cannot be empty")
        if quote_text in texts:
            errors.append(f"{label}.text: duplicate full-text sign; review before adding")
        texts.add(quote_text)
        if BAD_UNICODE.search(quote_text) or quote_text != quote_text.strip():
            errors.append(f"{label}.text: control/invisible characters or surrounding whitespace")
        if NOISY_TITLE.search(book):
            errors.append(f"{label}.book: edition/download artefact in title")
        if row["aspect"] not in ASPECTS:
            errors.append(f"{label}.aspect: explicitly select one of the 14 principles")
        if row["theme"] not in THEMES:
            errors.append(f"{label}.theme: expected reflection/scenery/inspiration")
        if row["readerLink"] and not row["readerLink"].startswith("https://weread.qq.com/"):
            errors.append(f"{label}.readerLink: current UI supports only weread.qq.com; use empty string otherwise")
        if "sourceType" in row and row["sourceType"] not in SOURCE_TYPES:
            errors.append(f"{label}.sourceType: invalid type")
        for field in ("weight", "quoteWeight"):
            value = row.get(field)
            if (isinstance(value, bool) or not isinstance(value, (float, int))
                    or not math.isfinite(value) or value <= 0):
                errors.append(f"{label}.{field}: expected finite positive numeric weight")
    return errors


def main() -> int:
    try:
        pool = json.loads(POOL.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(f"Quote pool cannot be parsed: {exc}", file=sys.stderr)
        return 1
    errors = check_pool(pool)
    if errors:
        for error in errors[:60]:
            print(f"ERROR: {error}", file=sys.stderr)
        if len(errors) > 60:
            print(f"... and {len(errors) - 60} more errors", file=sys.stderr)
        return 1
    from collections import Counter
    counts = Counter(q["aspect"] for q in pool["quotes"])
    print(f"Daily sign validation passed: {len(pool['quotes'])} signs; "
          f"{len(counts)} explicit principles; stable IDs and metadata intact.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
